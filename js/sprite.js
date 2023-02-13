
// eslint-disable-next-line no-undef
Vue.use(window.VueCodemirror);
// eslint-disable-next-line no-undef, no-unused-vars
const tempCanvas = document.createElement('canvas');
var vm = new Vue({
    el: '#container',
    mixins: [],
    components: {
        'vueSlider': window['vue-slider-component']
    },
    data: {
        loading: false,
        dialogVisible: false,
        tempSpriteUrl: '',
        iconJson: '',
        spriteQuality: 1,
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
            this.compressSprite();
        },
        compressSprite() {
            const canvas = this.$refs.canvas;
            tempCanvas.width = canvas.width;
            tempCanvas.height = canvas.height;
            tempCanvas.style.width = canvas.style.width;
            tempCanvas.style.height = canvas.style.height;
            const ctx = tempCanvas.getContext('2d');
            ctx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
            ctx.drawImage(canvas, 0, 0);
            this.tempSpriteUrl = tempCanvas.toDataURL('image/webp', this.spriteQuality);
            // tempCanvas.toBlob((blob) => {
            //     this.tempSpriteUrl = URL.createObjectURL(blob);
            // }, 'image/webp', this.spriteQuality);
        },
        clear() {
            this.iconJson = '';
            const canvas = this.$refs.canvas;
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            this.spriteQuality = 1;
            this.tempSpriteUrl = '';
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
                const mType = this.spriteQuality === 1 ? 'png' : 'webp';
                canvas.toBlob(function (blob) {
                    window.saveAs(blob, `${fileName}.${mType}`);
                }, `image/${mType}`, this.spriteQuality);
            }, 1000);
        }

    },
    mounted: function () {
        const fdnd = new filednd.FileDND(this.$refs['upload-icons']);
        const isImage = (file) => {
            const name = file.name.substring(file.name.lastIndexOf('.') + 1, Infinity);
            return ['png', 'jpg', 'jpeg', 'svg', 'webp'].includes(name.toLowerCase());
        }
        fdnd.dnd((files) => {
            const images = [];
            for (let i = 0, len = files.length; i < len; i++) {
                const type = files[i].type;
                if (type.indexOf('image/') > -1 || isImage(files[i])) {
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
