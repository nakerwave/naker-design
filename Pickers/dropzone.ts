import toastr from 'toastr';
import Dropzone from 'dropzone';
import { el, setStyle, setAttr, mount } from 'redom';
import ProgressBar from 'progressbar.js';

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
        this.createElements(formats),
        this.setAssetEvent();
        this.addDropZone(type, formats, maxWeight);
        this.setinPicker();
        this.addTitle();
        this.hide();
        dropzoneList[type] = this;
    }

    createElements(formats: Array<string>) {
        let formattext = this.getFormatText(formats);
        this.el = el('div.no-asset-button.asset-button', { onclick: (evt) => { evt.stopPropagation(); } },
            el('div.no-asset-icon.icon-upload', { style: { 'pointer-events': 'none' } },
                [el('span.path1'), el('span.path2'), el('span.path3')]
            )
        );

        this.el.addEventListener('click', () => {
            this.dropzoneEl.click();
        });

        this.dropzoneEl = el('div.upload_dropzone', [
            this.text = el('div.download', formattext),
            el('div.icon-upload', { style: { 'pointer-events': 'none' } },
                [el('span.path1'), el('span.path2'), el('span.path3')]
            )
        ]);
    }

    setAssetEvent() {
        assetPicker.on('blur', (type: string) => {
            this.hide();
        });

        assetPicker.on('focus', (type: string) => {
            if (type == this.type) this.show();
        });

        assetPicker.on('drag', (type: string, event: string) => {
            if (type == this.type) {
                if (event == 'start') this.showDropzone();
            }
        });
    }
    
    addTitle() {
        let title = el('div.upload_title.upload_title', 'Upload new ' + this.type);
        mount(this.dropzoneEl, title);
    }

    loadingBar: ProgressBar;
    loadingBarEl: HTMLElement;
    loadingBarText: HTMLElement;
    addProgressBar(container: HTMLElement, color: string) {
        this.loadingBarEl = el('div.asset-loading-bar', {style: { display: 'none'}})
        this.loadingBar = new ProgressBar.Line(this.loadingBarEl, {
            strokeWidth: 20,
            easing: 'easeInOut',
            duration: 200,
            trailColor: '.asset-loading-bar',
            color: color,
            svgStyle: { width: '100%', height: '100%' },
            // from: { color: color },
            // to: { color: colormain },
            // step: (state, bar) => {
            //     bar.path.setAttribute('stroke', state.color);
            // }
        });
        mount(container, this.loadingBarEl);
        // this.loadingBarText = el('div.loadingBarText'),
        // mount(container, this.loadingBarEl);
    }
    
    showProgress() {
        if ( !this.loadingBar ) return;
        this.loadingBar.set(0);
        setStyle(this.loadingBarEl, { display: 'block' });
        this.loadingBar.animate(0.1);
    }

    hideProgress() {
        if ( !this.loadingBar ) return;
        this.loadingBar.animate(1);
        setTimeout(() => {
            setStyle(this.loadingBarEl, { display: 'none' });
        }, 1000);
    }
    
    setinPicker() {
        mount(assetPicker.assetlist, this.el);
        mount(assetPicker, this.dropzoneEl);
        setAttr(assetPicker.el, { class: 'picker-with-dropzone asset-picker' });
    }

    getFormatText(formats: Array<string>) {
        return 'Supported formats: ' + formats.join(', ');
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
                    that.hideDropzone();
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
            assetPicker.hide();
            this.sending(file, xhr, formData);
            this.showProgress();
            this.hideDropzone();
        });

        this.dropzone.on('success', (file, response) => {
            this.success(file, response);
            this.hideProgress();
        });

        this.dropzone.on('error', (file, response: any) => {
            this.error(file, response);
            this.hideProgress();
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
        this.hide();
    }

    success(file, response) {
        this._success(response);
    }
    _success(response) {
        this.uploading = false;
        let url = response.secure_url;
        let name = response.original_filename;
        if (this.callback) this.callback(url, name);
        assetPicker.addWaitedAssetButton(url);
    }

    error(file, response) {
        this.uploading = false;
        if (response.error)
            toastr.error(response.error);
        else
            toastr.error(response);
    }

    showDropzone() {
        setStyle(this.dropzoneEl, { display: 'block' });
    }

    hideDropzone() {
        setStyle(this.dropzoneEl, { display: 'none' });
    }

    show() {
        setStyle(this.el, { display: 'block' });
        setAttr(this.text, { error: false });
    }

    hide() {
        this._hide();
    }
    
    _hide() {
        setStyle(this.el, { display: 'none' });
    }
}