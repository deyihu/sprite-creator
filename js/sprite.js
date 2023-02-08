
// eslint-disable-next-line no-undef
Vue.use(window.VueCodemirror);
// eslint-disable-next-line no-undef, no-unused-vars
var vm = new Vue({
    el: '#container',
    mixins: [],
    components: {
    },
    data: {
        loading: false,
        dialogVisible: false,
        iconJson: '',
        jsonCmOptions: {
            tabSize: 4,
            styleActiveLine: true,
            lineNumbers: true,
            lineWrapping: false,
            line: true,
            mode: 'application/json',
            theme: 'lesser-dark'
        }
    },
    watch: {

    },
    computed: {

    },
    methods: {
        loadImages(base64List) {
            let idx = 0;
            const icons = [];
            const load = () => {
                if (idx < base64List.length) {
                    const d = base64List[idx];
                    const image = new Image();
                    image.onload = () => {
                        icons.push({
                            w: image.width,
                            h: image.height,
                            icon: image,
                            name: d.name
                        });
                        idx++;
                        load();
                    };
                    image.src = d.url;
                } else {
                    this.drawIcons(icons);
                }
            };
            load();
        },
        drawIcons(icons) {
            const box = window.potpack(icons);
            const { w, h } = box;
            const canvas = this.$refs.canvas;
            canvas.width = w;
            canvas.height = h;
            canvas.style.width = `${w}px`;
            canvas.style.height = `${h}px`;
            this.clear();
            const ctx = canvas.getContext('2d');

            const json = {};
            icons.forEach(d => {
                const { x, y, w, h, icon, name } = d;
                ctx.drawImage(icon, x, y, w, h);
                json[name] = {
                    x, y, width: w, height: h
                };
            });
            this.iconJson = JSON.stringify(json, null, 4);
            this.loading = false;
        },
        clear() {
            this.iconJson = '';
            const canvas = this.$refs.canvas;
            // canvas.width = w;
            // canvas.height = h;
            // canvas.style.width = `${w}px`;
            // canvas.style.height = `${h}px`;
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        },
        download() {
            if (!this.iconJson) {
                return this;
            }
            const blob = new Blob([this.iconJson], { type: 'appliaction/json;charset=utf-8' });
            const fileName = new Date().getTime();
            window.saveAs(blob, `${fileName}.json`);

            setTimeout(() => {
                const canvas = this.$refs.canvas;
                canvas.toBlob(function (blob) {
                    window.saveAs(blob, `${fileName}.png`);
                }, 'image/png', 1);
            }, 1000);
        }

    },
    mounted: function () {
        window.FileAPI.event.dnd(this.$refs['upload-icons'], (files) => {
            const images = [];
            for (let i = 0, len = files.length; i < len; i++) {
                const type = files[i].type;
                if (type.indexOf('image/') > -1) {
                    images.push(files[i]);
                }
            }
            if (!images.length) {
                this.$message({
                    message: 'not find any images',
                    type: 'warning'
                });
                return;
            }
            this.loading = true;
            let idx = 0;
            const read = () => {
                fileReader.readAsDataURL(images[idx]);
            };
            const fileReader = new FileReader();
            const base64List = [];
            fileReader.onload = (result) => {
                const file = images[idx];
                let name = file.name;
                name = name.substring(0, name.lastIndexOf('.'));
                base64List.push({
                    url: fileReader.result,
                    name
                });
                idx++;
                if (idx < images.length) {
                    read();
                } else {
                    this.loadImages(base64List);
                }
            };
            read();
        });
    }
});
