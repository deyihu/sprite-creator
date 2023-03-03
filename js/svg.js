
// eslint-disable-next-line no-undef
Vue.use(window.VueCodemirror);
// eslint-disable-next-line no-undef, no-unused-vars
// const tempCanvas = document.createElement('canvas');
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
        drawIcons(icons) {
            this.iconJson = JSON.stringify(icons, null, 4);
            this.loading = false;
        },
        clear() {
            this.iconJson = '';
        },
        download() {
            if (!this.iconJson) {
                return this;
            }
            const fileName = new Date().getTime() + '-svg-collection';
            const blob = new Blob([this.iconJson], { type: 'appliaction/json;charset=utf-8' });
            window.saveAs(blob, `${fileName}.json`);
        }

    },
    mounted: function () {
        const fdnd = new filednd.FileDND(this.$refs['upload-icons']);
        const isSvg = (file) => {
            const name = file.name.substring(file.name.lastIndexOf('.') + 1, Infinity);
            return ['svg'].includes(name.toLowerCase());
        }
        fdnd.dnd((files) => {
            const images = [];
            for (let i = 0, len = files.length; i < len; i++) {
                const type = files[i].type;
                if (type.indexOf('image/svg') > -1 || isSvg(files[i])) {
                    images.push(files[i]);
                }
            }
            if (!images.length) {
                this.$message({
                    message: 'not find any svg',
                    type: 'warning'
                });
                return;
            }
            this.loading = true;
            let idx = 0;
            const read = () => {
                fileReader.readAsText(images[idx]);
            };
            const fileReader = new FileReader();
            const svgs = [];
            fileReader.onload = (result) => {
                const file = images[idx];
                const name = file.name;
                // name = name.substring(0, name.lastIndexOf('.'));
                svgs.push({
                    body: fileReader.result,
                    name
                    // path: file.path
                });
                idx++;
                if (idx < images.length) {
                    read();
                } else {
                    this.drawIcons(svgs);
                }
            };
            read();
        });
    }
});
