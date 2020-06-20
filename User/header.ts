import { LoginModal } from '../User/loginModal';
import { UserPearl } from '../User/userPearl';

import { el, setStyle, mount, unmount } from 'redom';

import { Undo, ProjectSavedOptions, UndoEvent } from '../Services/undo';
import { Session, User } from '../Services/session';
import { ExportModal } from './exportModal';

/*
  +------------------------------------------------------------------------+
  | USER HEADER                                                            |
  +------------------------------------------------------------------------+
*/

export class Header {

    undo: Undo<any>;
    session: Session;
    exportModal: ExportModal;
    control: HTMLElement;
    logoEl: HTMLElement;
    loaderEl: HTMLElement;
    projectname: HTMLElement;
    formname: HTMLElement;

    constructor(session: Session, undo: Undo<any>, exportModal: ExportModal) {
        this.undo = undo;
        this.session = session;
        this.exportModal = exportModal;

        this.setContent();
        this._setEvents();
        this.addLoginModal();
        this.checkUserAndProject();

        let project = session.getProject();
        if (project) this.setProject(project);

        session.loadUser((user: User) => {
            if (user) this.setUserPearl(user);
            this.checkUserAndProject();
        });
    }

    addLogo() {
        let EngineName = this.session.engine.charAt(0).toUpperCase() + this.session.engine.slice(1);
        let logo = el('div.naker-engine', 'Naker', {
                onclick: (evt) => { this.goToDashboard(); },
            },
            el('div.engine.color' + this.session.engine, '.' + EngineName)
        );
        mount(this.control, logo);
    }

    setContent() {
        this.control = el('div.preset-layer', [
            this.logoEl = el('div.dashboard-button', { 
                onclick: (evt) => { this.goToDashboard(); },
            }),
            this.loaderEl = el('div.loader'),
            this.formname = el('form.form-name', { autocomplete: "off", onsubmit: (evt) => { evt.preventDefault(); } },
                this.projectname = el('input.project-name', {
                    type: 'text',
                    placeholder: "Project's name",
                    // autocomplete: "none",
                    autocomplete: "off",
                    onblur: (evt) => { this.saveName(evt) },
                    onkeyup: (evt) => { if (evt.keyCode == 13) evt.target.blur(); }
                }),
            ),
        ]);
        mount(document.body, this.control);
    }

    goToDashboard() {
        // Save before leave
        this.session.saveOnlineAndLocal(() => {
            this.session.saveThumbnail(() => {
                window.location.href = '/dashboard/' + this.session.engine;
            });
        });
    }

    _setEvents() {
        this.undo.on(UndoEvent.Save, () => {
            this.saveAnimation();
        });

        this.undo.on(UndoEvent.Change, (change) => {
            if (change) this.saveAnimation();
        });

        this.session.on('connect', (user) => {
            this.checkUserAndProject();
        });

        this.session.on('disconnect', () => {
            this.checkUserAndProject();
        });

        this.session.on('project', (project) => {
            this.setProject(project);
        });

        window.addEventListener('focus', () => {
            this.loginModal.hide();
            this.checkUserAndProject();
        });
    }

    checkUserAndProject() {
        if (!this.session.api.isConnected() || !this.session.saving) {
            unmount(this.control, this.loaderEl);
            unmount(this.control, this.formname);
            this.userPearl.setIcoSphere();
        } else {
            mount(this.control, this.loaderEl);
            mount(this.control, this.formname);
            
            if (this.session.user) this.setUserPearl(this.session.user);
            
            // We automatically create new project if user is connected
            if (!this.session.isProjectSaved()) {
                this.saveProject();
            }
        }
    }

    currentName: string;
    saveName(evt: Event) {
        let name = evt.target.value;
        if (this.currentName == name) return;
        this.currentName = name;
        this.saveAnimation();
        this.session.saveProjectName(name);
    }

    setProject(project: ProjectSavedOptions) {
        if (project.name) this.setName(project.name);
        if (project.waterMark) this.exportModal.setWaterMark(project.waterMark);
        if (project.websiteUrl) this.exportModal.setWebsiteUrl(project.websiteUrl);
    }

    setName(name: string) {
        this.currentName = name;
        this.projectname.value = name;
    }

    saveProject() {
        this.session.createNew(() => {
            this.checkUserAndProject();
        });
        // Former code to save project on click, keep here in case change
        // if (!api.isConnected()) this.loginModal.show();
        // else {
        //     session.createNew(() => {
        //         this.checkUserAndProject();
        //     });
        // }
    }

    loginModal: LoginModal;
    userPearl: UserPearl;
    copiedCode: HTMLElement;
    copiedEffect: HTMLElement;

    addLoginModal() {
        this.userPearl = new UserPearl(this.logoEl, this.session);
        this.loginModal = new LoginModal(this.session, this.userPearl);
    }

    setUserPearl(data: User) {
        if (data.pearl && data.pearl.length != 0) {
            this.userPearl.updatePearl(data.pearl);
            let color = data.pearlcolor;
            let pearlColor = (color && color.length != 0) ? color : [255, 255, 255];
            this.userPearl.setColor(pearlColor);
        }
    }

    saveAnimation() {
        setStyle(this.loaderEl, { opacity: 1 });
        setTimeout(() => {
            setStyle(this.loaderEl, { opacity: 0 });
        }, 1000)
    }
}