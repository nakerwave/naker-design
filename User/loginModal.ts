import { Modal } from '../Layers/modal';
import { Api } from '../Services/api';
import { Spy, User } from '../Services/spy';
import { Session } from '../Services/session';
import { UserPearl } from './userPearl';

import toastr from 'toastr';
import { el, setStyle, mount } from 'redom';

declare let gapi:any;

export class LoginModal extends Modal {

    googleAuth: any;
    api: Api;
    spy: Spy;
    session: Session;
    userPearl: UserPearl;

    name: string;
    password: string;

    errorEl: HTMLElement;
    loaderEl: HTMLElement;

    constructor(session: Session, pearl:UserPearl) {
        super('Willing to <text class="colormain doublebold">save or export</text> your background?', 'Log in to have your project saved into your personal account and access its embed code', 'login-modal');
        this.session = session;
        this.api = this.session.api;
        this.spy = this.session.spy;
        this.userPearl = pearl;

        this.addContent();
        if (document.readyState === 'complete') {
            this.loadGoogle();
        } else {
            window.addEventListener("load", this.loadGoogle);
        }
    }
    
    loadGoogle() {
        gapi.load('auth2', () => {
            this.googleAuth = gapi.auth2.init({
                client_id: '746660630463-71395qasohf6hsv4ns19ac7b3lcri1cm.apps.googleusercontent.com',
                scope: 'profile email',
                immediate: false
            });
        });
    }

    addContent() {
        let modalContent = el('div.login-modal-content', [
            el('div.customGPlusSignIn', { onclick: () => this.tryLoginGoogle() },
                el('span.icon'),
                el('span.buttonText', 'Log in with Google'),
            ),
            el('div.form-group.or', 'or'),
            el('div.form-group',
                el('input.modal-input', {
                    type: 'text',
                    placeholder: 'Username or E-mail',
                    oninput: (evt) => { this.setName(evt) },
                    onkeypress: (e) => this.keypressInput(e)
                }),
            ),
            el('div.form-group',
                el('input.modal-input', {
                    type: 'password',
                    placeholder: 'Password',
                    oninput: (evt) => { this.setPassword(evt) },
                    onkeypress: (e) => this.keypressInput(e)
                }),
            ),
            this.errorEl = el('div.form-group.error-message.colorerror'),
            this.loaderEl = el('div.loader', { opacity: 0 }),
            el('div.button.colormainbg', { onclick: () => this.tryLogin() }, 'Log In'),
            el('a.colormain.doublebold', { href: '/signup' }, 'Sign Up'),
        ]);
        mount(this.control, modalContent);
    }

    keypressInput(e: Event) {
        if (e.which == 13) this.tryLogin();
    }
    
    setName(e: Event) {
        this.name = e.target.value;
    }

    setPassword(e: Event) {
        this.password = e.target.value;
    }

    showError(error: string) {
        this.errorEl.textContent = error;
        setStyle(this.errorEl, {display: 'block'});
    }

    showLoader() {
        setStyle(this.loaderEl, { opacity: 1 });
    }

    hideLoader() {
        setStyle(this.loaderEl, { opacity: 0 });
    }

    tryLogin() {
        if(this.name.length == 0) return this.showError('Enter a Username please 🙏');
        if (this.password.length == 0) return this.showError('Enter a Password please 🙏');
        if (this.name.length < 6 || this.password.length < 6) return this.showError('Username and Password must have 6 characters at least 🖐️+👍');
        this.showLoader();
        
        this.api.post('user/login', { name: this.name, password: this.password }, {}, (data) => {
            if (data.success) {
                this.loginUser(data);
            } else {
                this.hideLoader();
                this.showError(data.message + ' 😕');
            }
        });
	}

    tryLoginGoogle() {
        this.googleAuth.signIn().then(() => {
            var profile = this.googleAuth.currentUser.get().getBasicProfile();
            // log('ID: ' + profile.getId());
            // log('Full Name: ' + profile.getName());
            // log('Given Name: ' + profile.getGivenName());
            // log('Family Name: ' + profile.getFamilyName());
            // log('Image URL: ' + profile.getImageUrl());
            // log('Email: ' + profile.getEmail());
            this.showLoader();
            this.api.post('user/login/social', { name: profile.getName(), email: profile.getEmail() }, {}, (data) => {
                if (data.success) {
                    this.loginUser(data);
                    if (!data.pearl || (data.pearl && data.pearl.length == 0)) {
                        this.signupUser(data);
                        this.userPearl.updatePearl();
                        this.userPearl.savePearl(false);
                    }
                } else {
                    this.hideLoader();
                    this.showError(data.message + ' 😕');
                }
            });
        });
    }

    loginUser(data: User) {
        if(this.session.admin && !data.admin) return this.showError('You must be an admin to have access');
        toastr.success('Hey ! So nice to see you ' + data.name + ', Ready to make some magic? 🧙');
        this.hideModal();

        this.api.setToken(data);
        this.api.saveToken(data);
        this.spy.setUser(data);
        this.spy.startIntercom(data);
        this.spy.track("Platform Login");
        
        this.sendConnectToListeners(data);
    }
    

    signupUser(data: User) {
		// this.spy.alias(data.email);
        this.spy.track("Platform Signup");
        this.spy.setUser(data);
    }

    connectListeners: Array<Function> = [];
    on(event: 'connect', funct: Function) {
        if (event == 'connect') this.connectListeners.push(funct);
    }

    sendConnectToListeners(data: User) {
        for (let i = 0; i < this.connectListeners.length; i++) {
            this.connectListeners[i](data);
        }
    }
}
