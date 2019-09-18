
import toastr from 'toastr';
import Dropzone from 'dropzone';
import { el, setStyle, setAttr, mount } from 'redom';
import { assetPicker } from './assetPicker';

export let dropzoneList: any = {};
export let hideDropzones = () => {
    for (let i = 0; i < dropzoneList.length; i++) {
        dropzoneList[i].hide();
    }
}

export class NakerDropzone {

    el: HTMLElement;
    dropzoneElement: HTMLElement;
    text: HTMLElement;

    type: string;
    formats: Array<string>;
    maxWeight: number;
    callback: Function;

    constructor(type: string, formats: Array<string>, maxWeight: number, callback?: Function) {
        this.type = type;
        this.formats = formats;
        this.maxWeight = maxWeight;
        this.callback = callback;

        let formattext = this.getFormatText(formats);
        this.el = el('div.upload_overlay', { onclick: (evt) => { this.checkHide(evt) } },
            [
                this.text = el('div.download', formattext),
                this.dropzoneElement = el('div.upload_dropzone'),
                el('div.icon-add', { style: { 'pointer-events': 'none' } },
                    [el('span.path1'), el('span.path2'), el('span.path3')]
                )
            ]
        );
        setStyle(this.el, { display: 'none' });

        assetPicker.on('focus', (type: string) => {
            if (type == this.type) this.show();
        });

        assetPicker.on('blur', (type: string) => {
            this.hide();
        });

        this.addDropZone(type, formats, maxWeight);
        dropzoneList[type] = this;
    }

    setParent(parent: HTMLElement) {
        mount(parent, this.el);
    }

    addTitle() {
        let title1 = el('div.upload_title.upload_title1', 'Upload new ' + this.type);
        mount(this.el, title1);
        // let title2 = el('div.upload_title.upload_title2', 'or');
        // mount(this.el, title2);
        // let title3 = el('div.upload_title.upload_title3', 'Select one');
        // mount(this.el, title3);
    }

    setBesidePicker() {
        this.addTitle();
        this.setParent(assetPicker.el);
        setAttr(this.text, { class: 'download left_overlay' });
        setAttr(this.dropzoneElement, { class: 'upload_dropzone' });
        setAttr(assetPicker.el, { class: 'picker-with-dropzone asset-picker editor-scroll' });
    }

    getFormatText(formats: Array<string>) {
        return 'Supported formats: ' + formats.join(', ');
    }

    checkHide(evt:Event) {
        evt.stopPropagation();
        let elclass = evt.target.className;
        // If click outside then hide
        if (elclass.indexOf('upload_dropzone') == -1 && elclass.indexOf('download') == -1) this.hide();
    }

    uploadurl: string;
    dropzone: Dropzone;
    uploading = false;
    addDropZone(type: string, formats: Array<string>, maxWeight: number) {
        let uploadUrl = 'https://api.cloudinary.com/v1_1/naker-io/' + type + '/upload';
        this._addDropZone(uploadUrl, formats, maxWeight)
    }
    _addDropZone(uploadUrl: string, formats: Array<string>, maxWeight: number) {
        var that = this;
        this.dropzone = new Dropzone(this.dropzoneElement, {
            uploadMultiple: false,
            acceptedFiles: '.' + formats.join(',.'),
            timeout: 300000,
            autoProcessQueue: true,
            parallelUploads: 1,
            createImageThumbnails: false,
            // NOTE Keep "function" to have access to that
            init: function () {
                this.on("error", (file, errorMessage) => {
                    this.uploading = false;
                    if (typeof (errorMessage) === 'string')
                        that.errorBeforeUpload(errorMessage);
                });
            },
            accept: (file, done) => {
                let ok = this.checkFileBeforeAccept(file);
                if (ok) {
                    this.uploading = true;
                    done();
                }
            },
            url: uploadUrl,
        });


        this.dropzone.on('sending', (file, xhr, formData) => {
            this.sending(file, xhr, formData)
        });

        this.dropzone.on('success', (file, response) => {
            this.success(file, response);
        });

        this.dropzone.on('error', (file, response: any) => {
            this.error(file, response);
        });
    }

    checkFileBeforeAccept(file) {
        return this._checkFileBeforeAccept(file);
    }

    _checkFileBeforeAccept(file): boolean {
        if (file.size > this.maxWeight * 1024 * 1024) {
            this.errorBeforeUpload("Your file is too large, " + this.maxWeight + "MB is the maximum.");
            return false;
        } else if (this.uploading == true) {
            this.errorBeforeUpload("A " + this.type + " is already being uploaded, please wait");
            return false;
        }
        return true;
    }

    errorBeforeUpload(error: string) {
        this.text.textContent = error;
        setAttr(this.text, { error: true });
        toastr.error(error);
        setTimeout(() => {
            setAttr(this.text, { error: false });
            let formattext = this.getFormatText(this.formats);
            this.text.textContent = formattext;
        }, 3000);
    }

    sending(file, xhr, formData) {
        // Add naker key for cloudinary
        formData.append('timestamp', Date.now() / 1000 | 0);
        formData.append('upload_preset', 'hdtmkzvn');
        // Set to 2 because there is to step : Upload in Cloudnary and Download in Scene
        this.hide();
    }

    success(file, response) {
        this._success(response);
    }
    _success(response) {
        this.uploading = false;
        let url = response.secure_url;
        let name = response.original_filename;
        assetPicker.addWaitedAssetButton(url);
        if (this.callback) this.callback(url, name);
    }

    error(file, response) {
        this.uploading = false;
    }

    show() {
        setStyle(this.el, { display: 'block' });
        setAttr(this.text, { error: false });
    }

    hide() {
        this._hide();
        assetPicker.hide();
    }

    _hide() {
        setStyle(this.el, { display: 'none' });
    }
}