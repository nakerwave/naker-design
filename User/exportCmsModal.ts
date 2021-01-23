import { Modal } from '../Layers/modal';
import { Session } from '../Services/session';
import { Undo } from '../Services/undo';
import { CheckboxInput } from '../Inputs/checkbox';

import { el, mount, setStyle, setAttr, unmount, setChildren } from 'redom';
import { Event } from '@sentry/browser';
import find from 'lodash/find';
import Airtable from 'airtable';

declare let nakerpearl: any;

interface cms {
    name: string;
    article: string;
    logo: string;
}

var airtableBase = new Airtable({ apiKey: 'keyvYd17RuctTa2Ln' }).base('appTmDsoaK3FtuiTU');

export class ExportModal extends Modal {

    session: Session;
    undo: Undo<any>;
    engine: 'back' | 'form' | 'story' | 'studio';
    version: string

    constructor(session: Session, undo: Undo<any>, engine: 'back' | 'form' | 'story' | 'studio', version: string) {
        super('Embed your Design!', "", 'modal-export');
        this.session = session;
        this.undo = undo;
        this.engine = engine;
        this.version = version;
    }

    CMSList: Array<cms> = [
        {
            name: 'Embed',
            article: 'https://help.naker.io/en/collections/2457130-integration-and-export',
            logo: 'https://asset.naker.io/image/cms/script.png',
        },
        {
            name: 'Webflow',
            article: 'https://help.naker.io/en/articles/3560328-integration-in-webflow',
            logo: 'https://uploads-ssl.webflow.com/5e27764139e887058ca4ece7/5e2d6ecd8c2b173415c27b3a_Webflox.png',
        },
        {
            name: 'Bubble',
            article: 'https://help.naker.io/en/articles/3665861-integration-in-bubble',
            logo: 'https://uploads-ssl.webflow.com/5e27764139e887058ca4ece7/5e2d82f55b8bedd044b00e53_bubble.png',
        },
        {
            name: 'Carrd',
            article: 'https://help.naker.io/en/articles/3704738-integration-in-carrd-co',
            logo: 'https://asset.naker.io/image/cms/carrd.png',
        },
        {
            name: 'Divi',
            article: 'http://cakewp.com/divi-tutorials/how-to-add-interactive-particles-background/',
            logo: 'https://asset.naker.io/image/cms/logo-divi.png',
        },
        {
            name: 'Elementor ',
            article: 'http://cakewp.com/divi-tutorials/how-to-add-interactive-particles-background/',
            logo: 'https://asset.naker.io/image/cms/elementor.png',
        },
        {
            name: 'Wordpress',
            article: 'https://help.naker.io/en/articles/3420872-integration-in-wordpress',
            logo: 'https://uploads-ssl.webflow.com/5e27764139e887058ca4ece7/5e2d6ece8c2b17a1f9c27b3c_wordpress-1.png',
        },
        {
            name: 'Tilda',
            article: 'https://help.naker.io/en/articles/3559772-integration-in-tilda',
            logo: 'https://uploads-ssl.webflow.com/5e27764139e887058ca4ece7/5e2d6fa1d2e0674183b01dbd_tilda_logo_white.png',
        },
        {
            name: 'Unbounce',
            article: 'https://help.naker.io/en/articles/3560597-integration-in-unbounce',
            logo: 'https://uploads-ssl.webflow.com/5e27764139e887058ca4ece7/5e2d6e9a60dc1a282bef4fbc_1_ofK-nxtOuf4g0ARhYtM-Mg.png',
        },
        {
            name: 'Custom script',
            article: 'https://help.naker.io/en/articles/2868342-how-to-export-and-embed-my-project',
            logo: 'https://asset.naker.io/image/cms/script.png',
        },
    ];
    cmsContent: HTMLElement;
    setCmsList() {
        this.cmsContent = el('div.cms-list', [
            el('div.modal-text', 'First what is the CMS you use?'),
            this.CMSList.map(p =>
                el('div.input-button.cms-button.button-' + p.name, { onclick: () => { this.showExport(p); } },
                    el('img', { src: p.logo }),
                    el('div', p.name)
                )
            )
        ]);
        mount(this.control, this.cmsContent);
    }

    websiteUrlInput: HTMLElement;
    exportContent: HTMLElement;
    helpLink: HTMLElement;
    helpImage: HTMLElement;
    idInput: HTMLElement;
    classInput: HTMLElement;
    waterMarkLayer: HTMLElement;
    waterMarkCheckBox: HTMLElement;
    pushQualityLayer: HTMLElement;
    pushQualityCheckBox: HTMLElement;
    setExport() {
        this.exportContent = el('div.modal-content', [
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
            el('div.modal-layer', [
                // el('div.modal-number', '1.'),
                el('div.modal-text', 'Link of your website'),
                this.websiteUrlInput = el('input.modal-input', { type: 'text', onblur: (evt) => { this.addLinkRecord(evt) }, placeholder: 'https://' }),
            ]),
            el('div.modal-layer', [
                // el('div.modal-number', '2.'),
                el('div.modal-text', 'ID or the Class of the destination container'),
                this.idInput = el('input.modal-input.modal-small-input', { type: 'text', oninput: (evt) => { this.setEmbedId(evt) }, placeholder: 'ID' }),
                el('div.modal-or', 'OR'),
                this.classInput = el('input.modal-input.modal-small-input', { type: 'text', oninput: (evt) => { this.setEmbedClass(evt) }, placeholder: 'Class' }),
            ]),
            el('div.modal-layer', [
                // el('div.modal-number', '3.'),
                el('div.modal-text', 'Copy/paste this snippet in the head or body tag of your website. Check the tutorial above if needed.'),
                el('div.modal-code', { onclick: () => { this.setCodeToCopy() } }, [
                    this.copiedCode = el('div.modal-copied-text.editor-scroll'),
                    this.copiedEffect = el('div.modal-copied', 'Copied to Clipboard 👌'),
                    // el('div.icon-copypaste.modal-copyicon',
                    //     [el('span.path1'), el('span.path2'), el('span.path3')]
                    // )
                ]),
            ]),
            el('div.input-button.cms-button.cms-help-button', { onclick: () => { this.goToHelp(); } },
                this.helpImage = el('img'),
                this.helpLink = el('div')
            ),
        ]);
    }

    addCheckBox(layer: HTMLElement, label: string, value: boolean, callback: Function): CheckboxInput {
        let checkboxInput = new CheckboxInput(layer, label, value);
        checkboxInput.on('change', (checked) => {
            callback(checked);
            this.undo.pushState();
        });
        return checkboxInput;
    }

    addLayer(children: Array<HTMLElement> | HTMLElement, index?: number): HTMLElement {
        let newLayer = el('div.modal-layer', children);
        if (index !== undefined) {
            let beforChild = this.exportContent.childNodes[index];
            this.exportContent.insertBefore(newLayer, beforChild);
        } else {
            mount(this.exportContent, newLayer);
        }
        return newLayer;
    }

    addTitle(title: string, index?: number): HTMLElement {
        let newTitle = el('div.modal-sub-title', [
            el('div', title),
            el('div.horizontal-border-neumorphisme')

        ]);
        if (index !== undefined) {
            let beforChild = this.exportContent.childNodes[index];
            this.exportContent.insertBefore(newTitle, beforChild);
        } else {
            mount(this.exportContent, newTitle);
        }
        return newTitle;
    }

    shareContent: HTMLElement;
    footer: HTMLElement;
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
                el('div.input-button', { onclick: () => { this.showExport(this.currentCMS); } }, 'Go back'),
            ])
        ]);
    }

    cmsNavButton: HTMLElement;
    exportNavButton: HTMLElement;
    setFooter() {
        this.footer = el('div.modal-footer',
            el('div.modal-footer-center', [
                this.cmsNavButton = el('div.export-button-nav.export-button-nav-left', { onclick: () => { this.showCMSList(); } }),
                this.exportNavButton = el('div.export-button-nav.export-button-nav-right', { onclick: () => { this.showScriptExport(); } }),
            ])
        );
        mount(this.control, this.footer);
    }

    showScriptExport() {
        let cms = find(this.CMSList, (cms) => { return cms.name == 'Custom script' });
        this.showExport(cms);
    }

    showMainExport() {
        let cms = find(this.CMSList, (cms) => { return cms.name == 'Embed' });
        this.showExport(cms);
        unmount(this.control, this.footer);
    }

    currentCMS: cms;
    showExport(cms?: cms) {
        this.currentCMS = cms;
        this.helpLink.innerText = 'Show ' + cms.name + ' tutorial';
        this.title.textContent = 'Embed your Design!';
        setAttr(this.helpImage, { src: cms.logo });
        unmount(this.control, this.shareContent);
        unmount(this.control, this.cmsContent);
        mount(this.control, this.exportContent);
        mount(this.control, this.footer);
        setAttr(this.exportNavButton, { active: true });
        setAttr(this.cmsNavButton, { active: false });
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

    goToHelp() {
        window.open(this.currentCMS.article, '_blank');
    }

    showCMSList() {
        this.title.textContent = 'Embed your Design!';
        unmount(this.control, this.shareContent);
        unmount(this.control, this.exportContent);
        mount(this.control, this.cmsContent);
        mount(this.control, this.footer);
        setAttr(this.exportNavButton, { active: false });
        setAttr(this.cmsNavButton, { active: true });
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
        unmount(this.control, this.cmsContent);
        mount(this.control, this.shareContent);
        unmount(this.control, this.footer);
        if (!this.pearl)
            this.pearl = nakerpearl.render({ container: this.sharePearl, model: 'https://d2uret4ukwmuoe.cloudfront.net/qe2qvy7gsehehim68v88t/scene.glb', waterMark: false, hdr: true, material: { metallic: 1, albedocolor: this.session.engineColor } });
    }


    shareFacebook() {
        this.session.spy.track('Sharing_Social Click', { network: 'facebook' });
        let url = encodeURIComponent(this.shareUrl)
        window.open("https://www.facebook.com/sharer.php?u=" + url + "&t=" + this.shareText);
        this.showExport(this.currentCMS);
    }

    shareTwitter() {
        this.session.spy.track('Sharing_Social Click', { network: 'twitter' });
        let url = encodeURIComponent(this.shareUrl)
        window.open("http://www.twitter.com/share?url=" + url + "&text=" + this.shareText);
        this.showExport(this.currentCMS);
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
            this.copyToClipboard('https://harbor.naker.io/' + this.engine + '/' + this.undo.getProjectOptionsId());
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
        let text = '<script data-who="💎 Made with naker.io 💎" src="' + viewerUrl + '" data-option="' + JsonString + '" ' + idText + '></script>';
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
            this.showExport(this.currentCMS);
        }, 3000);
    }

    show() {
        if (this.currentCMS) this.showExport(this.currentCMS);
        else this.showCMSList();
        let project = this.undo.getProjectOptions();
        this.setWaterMark(project.waterMark);
        this.setPushQuality(project.pushQuality);
        this.setWebsiteUrl(project.websiteUrl);

        this._show();
        this.session.saveThumbnail();
    }
}
