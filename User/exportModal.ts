import { Modal } from '../Layers/modal';
import { Session } from '../Services/session';
import { Undo } from '../Services/undo';

import { el, mount, setStyle } from 'redom';

export class ExportModal extends Modal {

    session: Session;
    undo: Undo;
    engine: 'back' | 'form' | 'story';
    version: string

    constructor(session: Session, undo: Undo, engine: 'back' | 'form' | 'story', version:string, helpurl: string) {
        super('<text class="colormain bold">Embed</text> your Design!', "Paste the code below in your HTML. Or insert the ID of the HTML element which will draw the scene");
        this.session = session;
        this.undo = undo;
        this.engine = engine;
        this.version = version;

        this.addContent(helpurl);
    }

    content: HTMLElement;
    footer: HTMLElement;
    addContent(helpurl: string) {
        this.content = el('div.modal-content', [
            el('div.modal-explanation.colormain.bold', "For more help, check this ",
                el('a', { target: '_blank', href: helpurl }, "article"),
            ),
            el('input.modal-input', { type: 'text', oninput: (evt) => { this.setContainerId(evt) }, onblur: () => { this.setCodeToCopy() }, placeholder: 'Node ID container' }),
            el('div.modal-code', { onclick: () => { this.setCodeToCopy() } }, [
                this.copiedCode = el('div.modal-copied-text', 
                ),
                this.copiedEffect = el('div.modal-copied', 'Copied to Clipboard 👌'),
                el('div.icon-copypaste.modal-copyicon',
                    [el('span.path1'), el('span.path2'), el('span.path3')]
                )
            ]),
        ]);
        mount(this.control, this.content);

        this.footer = el('div.modal-footer', {
            onclick: () => {
                this.copyLink();
            }
        }, [
            el('div.icon-group.modal-footer-icon',
                [el('span.path1'), el('span.path2'), el('span.path3')]
            ),
            this.footerText = el('a.modal-footer-text', 'Share Project')
        ]);
        // el('div.button.facebook-button', { onclick: () => { this.shareFacebook() } }, 'Share on Facebook'),
        //     el('div.button.twitter-button', { onclick: () => { this.shareTwitter() } }, 'Share on Twitter'),
        mount(this.control, this.footer);
    }

    // shareFacebook() {
    //     spy.track('Sharing_Social Click');
    //     let url = encodeURIComponent('https://harbor.naker.io/' + this.engine + '/' + this.session.getProjectId() + '/')
    //     window.open("https://www.facebook.com/sharer.php?u=" + url);
    // }

    // shareTwitter() {
    //     spy.track('Sharing_Social Click');
    //     let url = encodeURIComponent('https://harbor.naker.io/' + this.engine + '/' + this.session.getProjectId() + '/'
    //     )
    //     window.open("http://www.twitter.com/share?url=" + url + "&text=See my new ' + this.engine + ' made on Naker : ");
    // }

    // setWaterMarkOption(evt) {
    //     console.log(evt);
    // }

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

    containerId: string;
    setContainerId(evt: Event) {
        this.containerId = evt.target.value;
        this.setEmbedCode();
    }

    setCodeToCopy() {
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
        let idText = (this.containerId) ? 'data-container="' + this.containerId + '"' : '';
        let JsonString = this.undo.getProjectJsonString();
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
}
