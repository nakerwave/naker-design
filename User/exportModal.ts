import { Modal } from '../Layers/modal';
import { Session } from '../Services/session';
import { Undo } from '../Services/undo';

import { el, mount, setStyle } from 'redom';

export class ExportModal extends Modal {

    session: Session;
    undo: Undo;

    constructor(session: Session, undo: Undo) {
        super('<text class="colormain doublebold">Embed</text> your Background!', "Paste the code below in your HTML. Or insert the ID of the HTML element which will draw the background");
        this.session = session;
        this.undo = undo;

        this.addContent();
    }

    addContent() {
        let modalContent = el('div.modal-content', [
            el('div.modal-explanation.colormain.doublebold', "For more help, check this ",
                el('a', { target: '_blank', href: 'https://help.naker.io/en/articles/3332427-how-to-embed-my-background' }, "article"),
            ),
            el('input.modal-input', { type: 'text', oninput: (evt) => { this.setContainerId(evt) }, onblur: () => { this.setCodeToCopy() }, placeholder: 'Node ID container' }),
            el('div.modal-code', { onclick: () => { this.setCodeToCopy() } }, [
                this.copiedCode = el('div.modal-copied-text'),
                this.copiedEffect = el('div.modal-copied', 'Copied to Clipboard 👌')
            ]),
        ]);
        mount(this.control, modalContent);

        let footer = el('div.modal-footer', {
            onclick: () => {
                this.copyLink();
            }
        }, [
            el('div.icon-group.modal-footer-icon',
                [el('span.path1'), el('span.path2'), el('span.path3')]
            ),
            this.footerText = el('a.modal-footer-text', 'Share Project')
        ]);
        mount(this.control, footer);
    }

    copiedCode: HTMLElement;
    copiedEffect: HTMLElement;
    footerText: HTMLElement;
    copyLink() {
        this.session.saveOnlineAndLocal(() => {
            this.copyToClipboard('https://harbor.naker.io/back/' + this.session.getProjectId());
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
        let idText = (this.containerId) ? "data-container='" + this.containerId + "'" : "";

        let json = this.undo.getProjectJson();
        delete json.assets;
        delete json.palette;
        let JsonString = JSON.stringify(json);

        let text = "<script data-who='💎 Made with naker.io 💎' src='https://d23jutsnau9x47.cloudfront.net/back/v1.0.4/viewer.js' data-back='" + JsonString + "' " + idText + "></script>";
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
