
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

    uploader: HTMLElement;
    dropzoneElement: HTMLElement;
    text: HTMLElement;
    banks: HTMLElement;

    type: string;
    formats: Array < string > ;
    maxWeight: number;

    constructor(type: string, formats: Array < string > , maxWeight: number, callback ? : Function) {
        this.type = type;
        this.formats = formats;
        this.maxWeight = maxWeight;
        
        let formattext = this.getFormatText(formats);
        this.uploader = el('div.upload_overlay', { onclick: (evt) => { this.checkHide(evt) } },
            [
                el('div.modal-close.icon-close', { onclick: (evt) => { this.checkHide(evt); } },
                    [el('span.path1'), el('span.path2'), el('span.path3')]
                ),
                this.text = el('div.download', formattext),
                this.dropzoneElement = el('div.upload_dropzone'),
            ]
        );
        mount(document.body, this.uploader);
        setStyle(this.uploader, { display: 'none' });

        assetPicker.addFocusListener((type:string) => {
            if (type == this.type) this.show();
        });

        this.addDropZone(type, formats, maxWeight, callback);
        dropzoneList[type] = this;
    }

    getFormatText(formats: Array<string>) {
        return 'Supported formats: ' + formats.join(', ');
    }

    checkHide(evt) {
        let elclass = evt.target.className;
        // If click outside then hide
        if (elclass.indexOf('upload_dropzone') == -1 && elclass.indexOf('download') == -1) this.hide();
    }

    uploadurl: string;
    dropzone: Dropzone;
    uploading = false;
    addDropZone(type: string, formats: Array<string>, maxWeight: number, callback: Function) {
        let uploadUrl = 'https://api.cloudinary.com/v1_1/naker-io/' + type + '/upload';
        this._addDropZone(uploadUrl, formats, maxWeight, callback)
    }
    _addDropZone(uploadUrl: string, formats: Array < string > , maxWeight: number, callback: Function) {
        var that = this;
        this.dropzone = new Dropzone(this.dropzoneElement, {
            uploadMultiple: false,
            acceptedFiles: '.' + formats.join(',.'),
            timeout: 300000,
            autoProcessQueue: true,
            parallelUploads: 1,
            createImageThumbnails: false,
            // NOTE Keep "function" to have access to that
            init: function() {
                this.on("error", (file, errorMessage) => {
                    this.uploading = false;
                    if (typeof(errorMessage) === 'string')
                        that.errorDropzone(errorMessage);
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
            this.sending(formData)
        });

        this.dropzone.on('success', (file, response) => {
            this.success(response, callback);
        });

        this.dropzone.on('error', (file, response: any) => {
            this.uploading = false;
        });
    }

    checkFileBeforeAccept (file) {
        return this._checkFileBeforeAccept(file);
    }

    _checkFileBeforeAccept (file):boolean {
        if (file.size > this.maxWeight * 1024 * 1024) {
            this.errorDropzone("Your file is too large, " + this.maxWeight + "MB is the maximum.");
            return false;
        } else if (this.uploading == true) {
            this.errorDropzone("A " + this.type + " is already being uploaded, please wait");
            return false;
        }
        return true;
    }

    sending(formData) {
        // Add naker key for cloudinary
        formData.append('timestamp', Date.now() / 1000 | 0);
        formData.append('upload_preset', 'hdtmkzvn');
        // Set to 2 because there is to step : Upload in Cloudnary and Download in Scene
        this.hide();
    }

    success(response, callback: Function) {
        this._success(response, callback);
    }
    _success(response, callback:Function) {
        this.uploading = false;
        let url = response.secure_url;
        let name = response.original_filename;
        assetPicker.addWaitedAssetButton(url);
        callback(url, name);
    }

    errorDropzone(error: string) {
        this.text.textContent = error;
        setAttr(this.text, { error: true });
        toastr.error(error);
        setTimeout(() => {
            setAttr(this.text, { error: false });
            let formattext = this.getFormatText(this.formats);
            this.text.textContent = formattext;
        }, 3000);
    }

    show() {
        setStyle(this.uploader, { display: 'block' });
        setAttr(this.text, { error: false });
    }

    hide() {
        this._hide();
    }

    _hide() {
        setStyle(this.uploader, { display: 'none' });
    }
}