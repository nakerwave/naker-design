
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
    dropzoneEl: HTMLElement;
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
        this.el = el('div.no-asset-button.asset-button', { onclick: (evt) => { this.checkHide(evt) } },
            el('div.no-asset-icon.icon-add', { style: { 'pointer-events': 'none' } },
                [el('span.path1'), el('span.path2'), el('span.path3')]
            )
        );

        this.el.addEventListener('click', () => {
            this.dropzoneEl.click();
        });
            
        this.dropzoneEl = el('div.upload_dropzone', [
            this.text = el('div.download', formattext),
            el('div.icon-add', { style: { 'pointer-events': 'none' } },
                [el('span.path1'), el('span.path2'), el('span.path3')]
            )
        ]);

        assetPicker.on('blur', (type: string) => {
            this.hide();
        });

        assetPicker.on('drag', (type: string, event:string) => {
            if (type == this.type) {
                if (event == 'start') this.show();
            }
        });

        this.addDropZone(type, formats, maxWeight);
        dropzoneList[type] = this;
    }
    
    addTitle() {
        let title1 = el('div.upload_title.upload_title1', 'Upload new ' + this.type);
        mount(this.dropzoneEl, title1);
    }
    
    setBesidePicker() {
        this.addTitle();
        mount(assetPicker.assetlist, this.el);
        mount(assetPicker, this.dropzoneEl);
        setAttr(assetPicker.el, { class: 'picker-with-dropzone asset-picker' });
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
        this.dropzone = new Dropzone(this.dropzoneEl, {
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
                    if (typeof (errorMessage) === 'string') {
                        if (errorMessage == "You can't upload files of this type.") errorMessage = that.getFormatText(that.formats);
                        that.errorBeforeUpload(errorMessage);
                    }
                });

                this.on("dragleave", () => {
                    that.hide();
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
        toastr.error(error);
        this.hide();
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
        setStyle(this.dropzoneEl, { display: 'block' });
        setAttr(this.text, { error: false });
    }

    hide() {
        this._hide();
    }
    
    _hide() {
        setStyle(this.dropzoneEl, { display: 'none' });
    }
}