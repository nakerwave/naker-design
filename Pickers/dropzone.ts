import { asset, assetPicker } from './assetPicker';

import toastr from 'toastr';
import Dropzone from 'dropzone';
import { el, setStyle, setAttr, mount } from 'redom';

export let dropzoneList: Array<DropUi> = [];
export let hideDropzones = () => {
    for (let i = 0; i < dropzoneList.length; i++) {
        dropzoneList[i].hide();
    }
}

export class DropLogic extends Dropzone {

    type: string;
    uploadUrl: string;
    formats: Array<string>;
    maxWeight: number;
    callback: Function;

    constructor(type: string, uploadUrl: string, formats: Array<string>, maxWeight: number, callback?: Function) {
        super(el('div'), {
            uploadMultiple: false,
            acceptedFiles: '.' + formats.join(',.'),
            timeout: 300000,
            autoProcessQueue: true,
            parallelUploads: 1,
            createImageThumbnails: false,
            url: uploadUrl,
            // NOTE Keep "function" to have access to that
            init: function () {
                this.on("error", (file, errorMessage) => {
                    this.uploading = false;
                    if (typeof (errorMessage) === 'string') {
                        if (errorMessage == "You can't upload files of this type.") errorMessage = this.getFormatText(this.formats);
                        this.errorBeforeUpload(errorMessage);
                    }
                });
            },
            accept: (file, done) => {
                let ok = this.checkFileBeforeAccept(file);
                if (ok) {
                    this.uploading = true;
                    done();
                }
            },
        });
        this.type = type;
        this.formats = formats;
        this.uploadUrl = uploadUrl;
        this.maxWeight = maxWeight;
        this.callback = callback;
        this.addEvent();
    }

    getFormatText() {
        return 'Supported formats: ' + this.formats.join(', ');
    }

    uploading = false;
    addEvent() {
        this.on("sending", (file, xhr, formData) => {
            this.sending(file, xhr, formData);
        });

        this.on("success", (file, response) => {
            this.success(file, response);
        });

        this.on("error", (file, response: any) => {
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
    }

    headers = {};
    addHeader(key: string, value: string) {
        this.headers[key] = value;
    }

    sending(file, xhr, formData) {
        // Add naker key for cloudinary
        formData.append('timestamp', Date.now() / 1000 | 0);
        for (const key in this.headers) {
            const value = this.headers[key];
            formData.append(key, value);
        }
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
}

export class DropUi {

    container: HTMLElement;
    text: HTMLElement;
    manageDrop: Function;

    constructor(callback: Function) {
        this.createElements();
        this.addTitle();
        this.hide();
        dropzoneList.push(this);
        this.manageDrop = callback;
    }

    createElements() {
        this.container = el('div.upload_dropzone', [
            this.text = el('div.download'),
            el('div.icon-upload', { style: { 'pointer-events': 'none' } },
                [el('span.path1'), el('span.path2'), el('span.path3')]
            )
        ]);
    }

    parent: HTMLElement;
    setParent(parent: HTMLElement) {
        this.parent = parent;
        mount(parent, this.container);
        this.setAssetEvent();
    }

    setAssetEvent() {
        this.parent.addEventListener('dragover', (evt) => {
            this.noPropagation(evt);
            this.show();
        }, false);

        this.parent.addEventListener('dragenter', (evt) => {
            this.noPropagation(evt);
            this.show();
        }, false);

        this.parent.addEventListener('dragleave', (evt) => {
            this.noPropagation(evt);
            this.hide();
        }, false);

        this.parent.addEventListener('dragend', (evt) => {
            this.noPropagation(evt);
            this.hide();
        }, false);

        this.parent.addEventListener('drop', (evt) => {
            this.noPropagation(evt);
            this.manageDrop(evt);
            this.hide();
        }, false);
    }

    noPropagation(evt: DragEvent) {
        evt.stopPropagation();
        if (evt.preventDefault) {
            return evt.preventDefault();
        } else {
            return evt.returnValue = false;
        }
    }

    addTitle() {
        let title = el('div.upload_title.upload_title', 'Upload');
        mount(this.container, title);
    }

    setInAssetPicker() {
        this.setParent(assetPicker.el);
        setAttr(assetPicker.el, { class: 'picker-with-dropzone asset-picker' });
    }

    // errorBeforeUpload(error: string) {
    //     toastr.error(error);
    //     this.hide();
    // }

    showError(error: string) {
        toastr.error(error);
    }

    show() {
        setStyle(this.container, { display: 'block' });
    }

    hide() {
        setStyle(this.container, { display: 'none' });
    }
}

export class SimpleDropzone extends DropLogic {

    dropUi: DropUi;

    constructor(type: string, uploadUrl: string, formats: Array<string>, maxWeight: number, callback?: Function) {
        super(type, uploadUrl, formats, maxWeight, callback);
        this.dropUi = new DropUi((evt) => { this.drop(evt) });
    }

}

export class DropzoneAndAsset extends SimpleDropzone {

    uploadButton: HTMLElement;
    constructor(type: asset['type'], uploadUrl: string, formats: Array<string>, maxWeight: number, callback?: Function) {
        super(type, uploadUrl, formats, maxWeight, callback);
        // this.dropUi.setInAssetPicker();

        this.on("sending", (file, xhr, formData) => {
            assetPicker.show();
            let fileName = file.name;
            this.toBase64(file, (base64) => {
                let asset = assetPicker.addImage(fileName, base64);
                setAttr(asset.button, { loading: true });
            });
        });

        this.on("success", (file, response) => {
            let fileName = file.name;
            let asset = assetPicker.getAssetByName(type, fileName);
            setAttr(asset.button, { loading: false });
        });

        this.uploadButton = el('div.upload', { onclick: (e) => { e.stopPropagation(); e.preventDefault(); this.element.click(); } }, 'Upload (' + formats.join(', ') + ')');
        assetPicker.el.prepend(this.uploadButton);
    }

    toBase64(file, callback: Function) {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => { callback(reader.result); };
        // reader.onerror = error => reject(error);
    }

}