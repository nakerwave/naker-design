import { Modal } from '../Layers/modal';
import { Session } from '../Services/session';
import { Undo } from '../Services/undo';
import { CheckboxInput } from '../Inputs/checkbox';

import { el, mount, setStyle, setAttr, unmount } from 'redom';
import { Event } from '@sentry/browser';
import Airtable from 'airtable';

declare let nakerpearl: any;

var airtableBase = new Airtable({ apiKey: 'keyvYd17RuctTa2Ln' }).base('appTmDsoaK3FtuiTU');

export class ExportModal extends Modal {

    session: Session;
    undo: Undo<any>;
    engine: 'back' | 'form' | 'story' | 'studio';
    version: string
    exportContent: HTMLElement;

    constructor(session: Session, undo: Undo<any>, engine: 'back' | 'form' | 'story' | 'studio', version: string) {
        super('Embed your Design', "", 'modal-export');
        this.session = session;
        this.undo = undo;
        this.engine = engine;
        this.version = version;
        this.exportContent = el('div.modal-content');
        mount(this.control, this.exportContent);
    }

    websiteUrlInput: HTMLElement;
    helpLink: HTMLElement;
    helpImage: HTMLElement;
    idInput: HTMLElement;
    classInput: HTMLElement;
    waterMarkLayer: HTMLElement;
    waterMarkCheckBox: HTMLElement;
    pushQualityLayer: HTMLElement;
    pushQualityCheckBox: HTMLElement;
    setExport() {
        let scriptLayer = el('div.modal-layer', [
            // this.waterMarkLayer = el('div.modal-layer', [
            //     el('div.modal-text.modal-checkbox-text', 'Naker watermark'),
            //     el('div.main-checkbox.modal-checkbox',
            //         this.waterMarkCheckBox = el('button.btn.btn-sm.btn-toggle', { type: 'button', 'aria-pressed': 'false', autocomplete: 'off', checked: true, onclick: () => { this.checkWatermark() } },
            //             el('div.handle')
            //         )
            //     )
            // ]),
            // this.pushQualityLayer = el('div.modal-layer', [
            //     el('div.modal-text.modal-checkbox-text', 'Keep HD (Hard on CPU)'),
            //     el('div.main-checkbox.modal-checkbox',
            //         this.pushQualityCheckBox = el('button.btn.btn-sm.btn-toggle', { type: 'button', 'aria-pressed': 'false', autocomplete: 'off', checked: false, onclick: () => { this.checkPushQuality() } },
            //             el('div.handle')
            //         )
            //     )
            // ]),
            // el('div', [
            //     el('div.modal-text', 'Link of your website'),
            //     this.websiteUrlInput = el('input.modal-input', { type: 'text', onblur: (evt) => { this.addLinkRecord(evt) }, placeholder: 'https://' }),
            // ]),
            el('div', [
                el('div.modal-text', 'ID or the Class of the destination container'),
                this.idInput = el('input.modal-input.modal-small-input', { type: 'text', oninput: (evt) => { this.setEmbedId(evt) }, placeholder: 'ID' }),
                el('div.modal-or', 'OR'),
                this.classInput = el('input.modal-input.modal-small-input', { type: 'text', oninput: (evt) => { this.setEmbedClass(evt) }, placeholder: 'Class' }),
            ]),
            el('div', [
                el('div.modal-text', 'Copy/paste this snippet in the head or body tag of your website. Check the tutorial above if needed.'),
                el('div.modal-code', { onclick: () => { this.setCodeToCopy() } }, [
                    this.copiedCode = el('div.modal-copied-text.editor-scroll'),
                    this.copiedEffect = el('div.modal-copied', 'Copied to Clipboard 👌'),
                    // el('div.icon-copypaste.modal-copyicon',
                    //     [el('span.path1'), el('span.path2'), el('span.path3')]
                    // )
                ]),
            ]),
        ]);
        mount(this.exportContent, scriptLayer);
    }

    addCheckBox(layer: HTMLElement, label: string, value: boolean, callback: Function): CheckboxInput {
        let checkboxInput = new CheckboxInput(layer, label, value);
        checkboxInput.on('change', (checked) => {
            callback(checked);
            this.undo.pushState();
        });
        return checkboxInput;
        // return checkboxButton;
    }

    addTitle(title: string, index?: number): HTMLElement {
        let newTitle = el('div.modal-sub-title', [
            el('div', title),
            el('div.horizontal-border-neumorphisme')

        ]);
        if (index !== undefined) {
            let beforChild = this.control.childNodes[index];
            this.control.insertBefore(newTitle, beforChild);
        } else {
            mount(this.exportContent, newTitle);
        }
        return newTitle;
    }

    addLayer(children: Array<HTMLElement> | HTMLElement, index?: number): HTMLElement {
        let newLayer = el('div.modal-layer', children);
        if (index !== undefined) {
            let beforChild = this.control.childNodes[index];
            this.control.insertBefore(newLayer, beforChild);
        } else {
            mount(this.exportContent, newLayer);
        }
        return newLayer;
    }

    shareContent: HTMLElement;
    shareUrlEl: HTMLElement;
    shareTitle: HTMLElement;
    shareCopied: HTMLElement;
    sharePearl: HTMLElement;
    setShare() {
        this.shareContent = el('div.modal-content.modal-share', [
            this.sharePearl = el('div.modal-pearl'),
            el('div.modal-layer', [
                this.shareTitle = el('div.modal-text'),
                el('div.modal-code.share-text', { onclick: () => { this.setShareCopiedAnimation() } }, [
                    this.shareUrlEl = el('div.modal-copied-text.modal-share-copied-text'),
                    this.shareCopied = el('div.modal-copied.share-copied', 'Copied to Clipboard 👌'),
                    // el('div.icon-copypaste.modal-copyicon',
                    //     [el('span.path1'), el('span.path2'), el('span.path3')]
                    // )
                ]),
            ]),
            el('div.modal-layer', [
                el('div.modal-text', 'Share'),
                el('div.modal-share-list', [
                    el('div.modal-share-icon.facebook-button.icon-facebook', { onclick: () => { this.shareFacebook() } }, [el('span.path1'), el('span.path2'), el('span.path3')]),
                    el('div.modal-share-icon.twitter-button.icon-twitter', { onclick: () => { this.shareTwitter() } }, [el('span.path1'), el('span.path2'), el('span.path3')]),
                    // pinterest not working after test
                    // el('div.modal-share-icon.pinterest-button.icon-pinterest', { onclick: () => { this.sharePinterest() } }, [el('span.path1'), el('span.path2'), el('span.path3')]),
                ])
            ]),
            el('div.modal-layer', [
                el('div.input-button', { onclick: () => { this.showExport(); } }, 'Go back'),
            ])
        ]);
    }

    showExport() {
        this.title.textContent = 'Embed your Design!';
        unmount(this.control, this.shareContent);
        mount(this.control, this.exportContent);
    }

    checkWatermark() {
        let checked = !this.undo.getProjectOptions().waterMark;
        this.undo.setProjectOption('waterMark', checked);
        setAttr(this.waterMarkCheckBox, { checked: checked });
        this.setEmbedCode();
        if (!checked) this.showShareAfterWatermark();
    }

    showShareAfterWatermark() {
        let shareUrl = 'https://app.naker.io/' + this.session.engine;
        let shareTitle = "Want to remove the waterMark? Please share Naker with your friends and let's make the web cool again:";
        this.showShare(shareUrl, shareTitle);
    }

    setWaterMark(waterMark: boolean) {
        if (waterMark !== undefined) setAttr(this.waterMarkCheckBox, { checked: waterMark });
        this.setEmbedCode();
    }

    checkPushQuality() {
        let checked = !this.undo.getProjectOptions().pushQuality;
        this.undo.setProjectOption('pushQuality', checked);
        setAttr(this.pushQualityCheckBox, { checked: checked });
        this.setEmbedCode();
    }

    setPushQuality(pushQuality: boolean) {
        if (pushQuality !== undefined) setAttr(this.pushQualityCheckBox, { checked: pushQuality });
        this.setEmbedCode();
    }

    websiteUrl = '';
    setWebsiteUrl(url: string) {
        if (url !== undefined) setAttr(this.websiteUrlInput, { value: url });
    }

    shareUrl: string;
    shareText = 'My friends, you should check Naker! A platform to design 3D interactive contents for websites. No code.';
    pearl;
    showShare(shareUrl: string, title: string, shareText?: string) {
        this.title.textContent = 'Share the love!';
        this.shareUrl = shareUrl;
        this.shareUrlEl.textContent = shareUrl;
        this.shareText = shareText;
        this.shareTitle.textContent = title;
        unmount(this.control, this.exportContent);
        mount(this.control, this.shareContent);
        if (!this.pearl)
            this.pearl = nakerpearl.render({ container: this.sharePearl, model: 'https://d2uret4ukwmuoe.cloudfront.net/qe2qvy7gsehehim68v88t/scene.glb', waterMark: false, hdr: true, material: { metallic: 1, albedocolor: this.session.engineColor } });
    }

    shareFacebook() {
        this.session.spy.track('Sharing_Social Click', { network: 'facebook' });
        let url = encodeURIComponent(this.shareUrl)
        window.open("https://www.facebook.com/sharer.php?u=" + url + "&t=" + this.shareText);
    }

    shareTwitter() {
        this.session.spy.track('Sharing_Social Click', { network: 'twitter' });
        let url = encodeURIComponent(this.shareUrl)
        window.open("http://www.twitter.com/share?url=" + url + "&text=" + this.shareText);
    }

    // sharePinterest() {
    //     this.session.spy.track('Sharing_Social Click', {network: 'pinterest'});
    //     let url = encodeURIComponent(this.shareUrl)
    //     window.open("http://pinterest.com/pin/create/button/?url = " + url + "&description=" + this.shareText);
    //     this.showExport(this.currentCMS);
    // }

    addLinkRecord(evt) {
        let url = evt.target.value;
        if (!url || url == this.undo.getProjectOptions().websiteUrl) return;
        this.undo.setProjectOption('websiteUrl', url);

        if (this.session.subDomain == 'development') return;
        let project = this.undo.getProjectOptions();
        let user = this.session.getUser();

        airtableBase('URL from export modal').create([
            {
                "fields": {
                    "Website": url,
                    "Engine": this.engine,
                    "Project ID": project.id,
                    "Project Name": project.name,
                    "User ID": user.id,
                    "User Name": user.name,
                    "User Email": user.email,
                }
            }
        ], function (err, records) {
            if (err) {
                console.error('error saving url in airtable', err);
                return;
            }
        });
    }

    copiedCode: HTMLElement;
    copiedEffect: HTMLElement;
    footerText: HTMLElement;
    copyLink() {
        this.session.saveOnlineAndLocal(() => {
            this.copyToClipboard('https://harbor.naker.io/' + this.engine + '/' + this.session.getProjectId());
            this.footerText.innerText = 'Link copied';
            setTimeout(() => {
                this.footerText.innerText = 'Share Project';
            }, 2000);
        });
    }

    embedContainer: string;
    setEmbedId(evt: Event) {
        this.embedContainer = evt.target.value;
        setAttr(this.classInput, { value: '' });
        this.setEmbedCode();
    }

    setEmbedClass(evt: Event) {
        this.embedContainer = '.' + evt.target.value;
        setAttr(this.idInput, { value: '' });
        this.setEmbedCode();
    }

    setCodeToCopy() {
        this.session.spy.track("Embed Code Copy");
        let code = this.setEmbedCode();
        this.copyToClipboard(code);
        this.setCopiedAnimation();
    }

    setEmbedCode() {
        let code = this.getEmbedCode();
        this.copiedCode.textContent = code;
        return code;
    }

    getEmbedCode() {
        let idText = (this.embedContainer) ? 'data-container="' + this.embedContainer + '"' : '';
        let waterMark = this.undo.getProjectOptions().waterMark;
        let JsonString = this.undo.getProjectJsonString({ waterMark: waterMark });
        let viewerUrl = 'https://d23jutsnau9x47.cloudfront.net/' + this.engine + '/' + this.version + '/viewer.js';
        let text = '<script data-who="NAKER.IO" src="' + viewerUrl + '" data-option="' + JsonString + '" ' + idText + '></script>';
        return text;
    }

    copyToClipboard(text: string) {
        let el = document.createElement('textarea');
        el.value = text;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
    }

    setCopiedAnimation() {
        setStyle(this.copiedEffect, { display: 'block' });
        setTimeout(() => {
            setStyle(this.copiedEffect, { display: 'none' });
        }, 2000);
    }

    setShareCopiedAnimation() {
        this.copyToClipboard(this.shareUrl);
        setStyle(this.shareCopied, { display: 'block' });
        setTimeout(() => {
            setStyle(this.shareCopied, { display: 'none' });
        }, 2000);
        setTimeout(() => {
            this.showExport();
        }, 3000);
    }

    show() {
        let project = this.undo.getProjectOptions();
        this.setWaterMark(project.waterMark);
        this.setPushQuality(project.pushQuality);
        this.setWebsiteUrl(project.websiteUrl);

        this._show();
        this.session.saveThumbnail();
    }
}
