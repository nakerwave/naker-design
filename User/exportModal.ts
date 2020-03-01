import { Modal } from '../Layers/modal';
import { Session } from '../Services/session';
import { Undo } from '../Services/undo';

import { el, mount, setStyle, setAttr, unmount } from 'redom';
import { Event } from '@sentry/browser';
import Airtable from 'airtable';

interface cms {
    name: string;
    article: string;
    logo: string;
}

var airtableBase = new Airtable({ apiKey: 'keyvYd17RuctTa2Ln' }).base('appTmDsoaK3FtuiTU');

export class ExportModal extends Modal {
    
    session: Session;
    undo: Undo;
    engine: 'back' | 'form' | 'story';
    version: string
    
    constructor(session: Session, undo: Undo, engine: 'back' | 'form' | 'story', version:string) {
        super('Embed your Design!', "", 'modal-export');
        this.session = session;
        this.undo = undo;
        this.engine = engine;
        this.version = version;
        
        this.setCmsList();
        this.setExport();
        this.setShare();
        this.setFooter();
    }

    CMSList: Array<cms> = [
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
            article: 'http://cakewp.com/divi-tutorials/how-to-add-interactive-particles-background/',
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
        this.cmsContent = el('div.cms-list.modal-content', [
            el('div.modal-text', 'First what is the CMS you use?'),
            this.CMSList.map(p =>
                el('div.button.input-button.cms-button.button-' + p.name, { onclick: () => { this.showExport(p); }},
                    el('img', { src: p.logo }),
                    el('div', p.name)
                )
            )
        ]);
        mount(this.control, this.cmsContent);
    }

    waterMarkCheckBox: HTMLElement;
    websiteUrlInput: HTMLElement;
    exportContent: HTMLElement;
    helpLink: HTMLElement;
    helpImage: HTMLElement;
    idInput: HTMLElement;
    classInput: HTMLElement;
    setExport() {
        this.exportContent = el('div.modal-content', [
            el('div', [
                el('div.button.input-button.cms-button.cms-help-button', { onclick: () => { this.goToHelp(); } },
                    this.helpImage = el('img'),
                    this.helpLink = el('div')
                ),
                el('div.modal-layer', [
                    el('div.modal-number', '1.'),
                    this.websiteUrlInput = el('input.modal-input', { type: 'text', onblur: (evt) => { this.addLinkRecord(evt) }, placeholder: 'Link of your website' }),
                ]),
                el('div.modal-layer', [
                    el('div.modal-number', '2.'),
                    el('div.modal-text', 'Put the ID or the Class of the destination container.'),
                    this.idInput = el('input.modal-input.modal-small-input', { type: 'text', oninput: (evt) => { this.setEmbedId(evt) }, onblur: () => { this.setCodeToCopy() }, placeholder: 'ID' }),
                    el('div.modal-or', 'or'),
                    this.classInput = el('input.modal-input.modal-small-input', { type: 'text', oninput: (evt) => { this.setEmbedClass(evt) }, onblur: () => { this.setCodeToCopy() }, placeholder: 'Class' }),
                ]),
                el('div.modal-layer', [
                    el('div.modal-number', '3.'),
                    el('div.modal-text', 'Copy/Paste this snippet in your website head tag following above tutorial.'),
                    el('div.modal-code', { onclick: () => { this.setCodeToCopy() } }, [
                        this.copiedCode = el('div.modal-copied-text.editor-scroll'),
                        this.copiedEffect = el('div.modal-copied', 'Copied to Clipboard 👌'),
                        // el('div.icon-copypaste.modal-copyicon',
                        //     [el('span.path1'), el('span.path2'), el('span.path3')]
                        // )
                    ]),
                ]),
                el('div.modal-layer', [
                    el('div.modal-text.modal-watermark-text', 'Naker watermark'),
                    el('div.main-checkbox.modal-watermark',
                        [
                            this.waterMarkCheckBox = el('input.checkbox', { type: 'checkbox', checked: true, id: 'waterMarkCheckbox', oninput: (evt) => { this.checkWatermark(evt) } }),
                            el('label.checkbox', { for: 'waterMarkCheckbox' }),
                        ]
                    ),
                ]),
            ]),
            // el('div.modal-right', [
            //     el('div.button.input-button.cms-button.cms-help-button', { onclick: () => { this.goToHelp(); } },
            //         this.helpImage = el('img'),
            //         this.helpLink = el('div')
            //     ),
            //     // this.helpLink = el('div.button.input-button', "Go to *** help", { onclick: () => { this.goToHelp(); } }),
            // ])
        ]);
    }

    shareContent: HTMLElement;
    footer: HTMLElement;
    setShare() {
        this.shareContent = el('div.modal-content', [
            el('div.modal-text', 'It is ok to remove the waterMark, but not cool to keep that super power to yourself. We kindly ask you to share Naker with your friends and give them super powers too!'),
            el('div.modal-footer-center.modal-share-list', [
                el('div.modal-share-icon.facebook-button.icon-facebook', { onclick: () => { this.shareFacebook() } }, [el('span.path1'), el('span.path2'), el('span.path3')]),
                el('div.modal-share-icon.twitter-button.icon-twitter', { onclick: () => { this.shareTwitter() } }, [el('span.path1'), el('span.path2'), el('span.path3')]),
                el('div.modal-share-icon.pinterest-button.icon-twitter', { onclick: () => { this.sharePinterest() } }, [el('span.path1'), el('span.path2'), el('span.path3')]),
                el('div.modal-share-icon.pinterest-button.icon-link', { onclick: () => { this.sharePinterest() } }, [el('span.path1'), el('span.path2'), el('span.path3')]),
            ])
        ]);
    }

    cmsNavButton: HTMLElement;
    exportNavButton: HTMLElement;
    setFooter() {
        this.footer = el('div.modal-footer', 
            el('div.modal-footer-center', [
                this.cmsNavButton = el('div.export-button-nav.export-button-nav-left', { onclick: () => { this.showCMSList(); } }),
                this.exportNavButton = el('div.export-button-nav.export-button-nav-right', { onclick: () => { this.showExport(this.currentCMS); } }),
            ])
        );
        mount(this.control, this.footer);
    }
    
    currentCMS: cms = this.CMSList[0];
    showExport(cms: cms) {
        this.currentCMS = cms;
        this.helpLink.innerText = 'Show ' + cms.name + ' tutorial';
        setAttr(this.helpImage, { src: cms.logo });
        unmount(this.control, this.shareContent);
        unmount(this.control, this.cmsContent);
        mount(this.control, this.exportContent);
        mount(this.control, this.footer);
        setAttr(this.exportNavButton, { active: true });
        setAttr(this.cmsNavButton, { active: false });
    }

    checkWatermark(evt: Event) {
        this.session.setWaterMark(evt.target.checked);
        if (!evt.target.checked) {
            unmount(this.control, this.exportContent);
            unmount(this.control, this.cmsContent);
            mount(this.control, this.shareContent);
            unmount(this.control, this.footer);
        }
        this.setEmbedCode();
    }

    setWaterMark(waterMark: boolean) {
        setAttr(this.waterMarkCheckBox, { checked: waterMark });
    }

    setWebsiteUrl(url: string) {
        setAttr(this.websiteUrlInput, {value: url});
    }

    goToHelp() {
        window.open(this.currentCMS.article, '_blank');
    }

    showCMSList() {
        unmount(this.control, this.shareContent);
        unmount(this.control, this.exportContent);
        mount(this.control, this.cmsContent);
        mount(this.control, this.footer);
        setAttr(this.exportNavButton, { active: false });
        setAttr(this.cmsNavButton, { active: true });
    }
    
    shareText = 'My friends, you should check Naker! A platform to design 3D interactive contents for websites. No code.';
    shareFacebook() {
        this.session.spy.track('Sharing_Social Click', {network: 'facebook'});
        let url = encodeURIComponent('https://app.naker.io/' + this.engine + '/')
        window.open("https://www.facebook.com/sharer.php?u=" + url + "&t=" + this.shareText);
        this.showExport(this.currentCMS);
    }

    shareTwitter() {
        this.session.spy.track('Sharing_Social Click', {network: 'twitter'});
        let url = encodeURIComponent('https://app.naker.io/' + this.engine + '/')
        window.open("http://www.twitter.com/share?url=" + url + "&text="+this.shareText);
        this.showExport(this.currentCMS);
    }

    sharePinterest() {
        this.session.spy.track('Sharing_Social Click', {network: 'pinterest'});
        let url = encodeURIComponent('https://app.naker.io/' + this.engine + '/')
        window.open("http://pinterest.com/pin/create/button/?url = " + url + "&description=" + this.shareText);
        this.showExport(this.currentCMS);
    }

    addLinkRecord(evt) {
        if (this.session.subDomain == 'development') return;
        let url = evt.target.value;
        let project = this.session.getProject();
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

    setWaterMarkOption(evt) {
        console.log(evt);
    }

    copiedCode: HTMLElement;
    copiedEffect: HTMLElement;
    footerText: HTMLElement;
    copyLink() {
        this.session.saveOnlineAndLocal(() => {
            this.copyToClipboard('https://harbor.naker.io/'+this.engine+'/' + this.session.getProjectId());
            this.footerText.innerText = 'Link copied';
            setTimeout(() => {
                this.footerText.innerText = 'Share Project';
            }, 2000);
        });
    }

    embedContainer: string;
    setEmbedId(evt: Event) {
        this.embedContainer = evt.target.value;
        setAttr(this.classInput, {value : ''});
        this.setEmbedCode();
    }

    containerId: string;
    setEmbedClass(evt: Event) {
        this.embedContainer = '.'+evt.target.value;
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
        let waterMark = this.session.getProject().waterMark;
        let JsonString = this.undo.getProjectJsonString({waterMark: waterMark});
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

    show() {
        this.showCMSList();
        this._show();
    }
}
