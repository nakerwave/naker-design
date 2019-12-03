
import { Api, Token } from './api';
import { Spy } from './spy';
import { Undo } from './undo';

import toastr from 'toastr';
import isEqual from 'lodash/isEqual';
import cloneDeep from 'lodash/cloneDeep';
import Cookies from 'js-cookie';


export interface User extends Token {
    id: string;
    admin: boolean;
    tutorial: boolean;
    email: string;
    name: string;
    pearl: Array<number>;
    pearlcolor: Array<number>;
};


export class Session {

    saveBeforeUnload = false;
    api: Api;
    spy: Spy;
    undo: Undo;

    subDomain: 'app' | 'staging' | 'test' | 'cruise' | 'development';
    engine: 'story' | 'back' | 'form';
    projectid: string;
    designer: string;
    name: string;
    getProjectJson: Function;

    environments = {
        app: {
            apiurl: 'https://naker-backend-prod.herokuapp.com/',
            saving: true,
            redirect: true,
            intercom: true,
            sentry: true,
            admin: false, // Need to be admin to log and enter
        },
        staging: {
            apiurl: 'https://naker-backend-prod.herokuapp.com/',
            saving: true,
            redirect: true,
            intercom: false,
            sentry: false,
            admin: true,
        },
        test: {
            apiurl: 'https://naker-backend.herokuapp.com/',
            saving: true,
            redirect: false,
            intercom: false,
            sentry: false,
            admin: true,
        },
        cruise: {
            apiurl: 'https://naker-backend.herokuapp.com/',
            saving: false,
            redirect: false,
            intercom: false,
            sentry: false,
            admin: false,
        },
        development: {
            apiurl: 'http://localhost:3000/',
            saving: false,
            redirect: true,
            intercom: false,
            sentry: false,
            admin: false,
        },
    };

    apiurl: string;
    saving: boolean;
    savingLocal = true;
    redirect: boolean;
    intercom: boolean;
    sentry: boolean;
    admin: boolean;

    // If all condition ok, then true
    currentlySaving = false;

    constructor(engine: 'story' | 'back' | 'form', api: Api, spy: Spy, undo:Undo) {
        this.setEngine(engine);
        
        this.api = api;
        this.spy = spy;
        this.undo = undo;
        this.spy.setEngine(this.spyPrefix[this.engine]);
        
        // getSubDomain allows testing on localhost
        let subDomain = api.getSubdomain();
        if (!subDomain) this.subDomain = 'development';
        else this.subDomain = subDomain;

        this.apiurl = this.environments[this.subDomain].apiurl;
        this.saving = this.environments[this.subDomain].saving;
        this.redirect = this.environments[this.subDomain].redirect;
        this.intercom = this.environments[this.subDomain].intercom;
        this.sentry = this.environments[this.subDomain].sentry;
        this.admin = this.environments[this.subDomain].admin;

        api.setHost(this.apiurl);
        api.onDisconnected = () => {
            this.setProjectId('');
            this.currentlySaving = false;
            this.sendDisconnectToListeners();
        };
        this.checkProjectId();

        window.addEventListener('beforeunload', () => {
            if (this.saveBeforeUnload) this.save();
        });

        window.addEventListener('focus', () => {
            let userCookie = Cookies.get('token');
            if (this.save) {
                if (userCookie == undefined) {
                    this.api.disconnect();
                }
            }
        });

        this.undo.on('save', () => {
            this.saveLocal();
        });
    }

    engineList = ['back', 'form', 'story'];
    sentryIds = {
        story: 'https://64462014944f48b3bc58327feb758f7c@sentry.io/1522591',
        back: 'https://7e62b4e539db4d2ba599726125f742e2@sentry.io/1539712',
        // form: 'https://7e62b4e539db4d2ba599726125f742e2@sentry.io/1539712'
    };
    spyPrefix = {
        story: 'NS',
        back: 'NB',
        form: 'NF'
    };
    engineColor = {
        story: [0, 153, 255],
        back: [255, 8, 114],
        form: [0, 204, 102],
    };

    setEngine(engine: 'story' | 'back' | 'form') {
        this.engine = engine;
    }

    ///////////////////////// USER /////////////////////////
    user: User;
    setUser(user: User) {
        this.user = user;
    }

    getUser(callback: Function) {
        if (this.api.isConnected()) {
            this.api.get('user', {}, (data) => {
                if (data.success !== false) {
                    this.setUser(data);
                    callback(data);
                } else {
                    this.api.disconnect();
                    callback(false);
                }
            });
        } else {
            callback(false);
        }
    }

    loginUser(data: User) {
        this.setUser(data);
        this.api.setToken(data);
        this.api.saveToken(data);
        this.spy.startIntercom(data);
        this.spy.track("Platform Login");

        this.sendConnectToListeners(data);
    }

    signupUser(data: User) {
        this.setUser(data);
        // this.spy.alias(data.email);
        this.spy.track("Platform Signup");
    }

    connectListeners: Array<Function> = [];
    disconnectListeners: Array<Function> = [];
    on(event: 'connect'|'disconnect', funct: Function) {
        if (event == 'connect') this.connectListeners.push(funct);
        if (event == 'disconnect') this.disconnectListeners.push(funct);
    }

    sendConnectToListeners(data: User) {
        for (let i = 0; i < this.connectListeners.length; i++) {
            this.connectListeners[i](data);
        }
    }

    sendDisconnectToListeners() {
        for (let i = 0; i < this.disconnectListeners.length; i++) {
            this.disconnectListeners[i]();
        }
    }

    ///////////////////////// PROJECT /////////////////////////
    checkProjectId() {
        let url = window.location.href;
        let urlArray = url.split('/');
        for (let i = 0; i < urlArray.length; i++) {
            let first = urlArray[i];
            let next = urlArray[i + 1];
            if (this.engineList.indexOf(first) != -1) {
                this.projectid = next;
            }
        }
        
        if (this.engine) {
            // If new project asked, remove stored data
            let query = this.api.getAllUrlParams();
            if (query.new) {
                Cookies.remove('naker_' + this.engine);
                this.setProjectId('');
            }

            if (this.sentry) this.spy.startSentry(this.sentryIds[this.engine]);

            var in10Minutes = 1 / (24 * 6);
            Cookies.set('last_engine', this.engine, {
                expires: in10Minutes
            });
        }
    }

    setProjectId(projectid:string) {
        this.projectid = projectid;
        history.pushState({}, null, '/' + this.engine + '/' + this.projectid);
    }

    getProject(callback: Function) {
        let cookie = Cookies.get('naker_' + this.engine);
        let cookieParsed;
        if (cookie) cookieParsed = JSON.parse(cookie);

        // If no id in url but one in cookie saved, we take it
        if (!this.projectid) {
            if (cookieParsed && cookieParsed.id) {
                this.setProjectId(cookieParsed.id);
            }
        // If id in url but do not match with cookie saved, we ignore bad cookie
        } else if (cookieParsed && (this.engine != cookieParsed.engine || this.projectid != cookieParsed.id)) {
            cookieParsed = null;
        }

        // We make sure project exist in the base
        if (this.projectid && this.saving) {
            this.api.get(this.engine, { id: this.projectid }, (data) => {
                if (data.success !== false) {
                    // We don't save engine in database
                    if (!data.engine) data.engine = this.engine;
                    // Cookie will always have the most recent data
                    if (cookieParsed) this.projectFound(callback, cookieParsed);
                    else this.projectFound(callback, data);
                } else {
                    this.setProjectId('');
                    if (cookieParsed) this.projectFound(callback, cookieParsed);
                    else this.projectFound(callback, false);
                }
            });
        } else {
            this.projectFound(callback, cookieParsed);
        }
    }

    projectFound(callback: Function, project: any) {
        callback(project);
        // Start auto save after get project to make sure we don't save empty project
        this.startAutoSave(30, 5);
    }

    createNew(callback?: Function) {
        if (!this.saving) return;
        this.api.post(this.engine + '/new', {name:'New '+ this.engine}, {}, (data) => {
            if (data.success) {
                this.setProjectId(data.id);
                this.currentlySaving = true;
                this.sendConnectToListeners(this.user);
                this.save();
            } else {
                toastr.error('🤷 Oups, there was an error while saving your project');
            }
            if (callback) callback(data.sucess);
        });
    }

    saveProjectName(name: string) {
        if (!this.engine) return;
        this.api.post(this.engine + '/name', { id: this.projectid, name: name }, {}, (data) => {
            if (!data.success) {
                toastr.error('🤷 Oups, there was an error while saving the new name');
            } else {
                this.name = name;
                this.saveLocal();
            }
        });
    }

    lastsave: any;
    lastlocalsave: any;
    startAutoSave(frequency: number, localfrequency?: number) {
        this.lastsave = new Date().getTime();

        setInterval(() => {
            if (document.hasFocus() && this.currentlySaving) {
                if (!this.projectid || !this.engine) {
                    this.currentlySaving = false;
                    return console.error("You can't save project online without a projectid and engine");
                }
                let now = new Date().getTime();
                // Avoid sending a lot of request when focus is back on window for instance
                if (now - this.lastsave < frequency * 800) return;
                this.lastsave = now;
                this.save();
            }
        }, frequency * 1000);

        if (localfrequency) {
            setInterval(() => {
                if (document.hasFocus()) {
                    let now = new Date().getTime();
                    // Avoid sending a lot of request when focus is back on window for instance
                    if (now - this.lastlocalsave < frequency * 800) return;
                    this.lastlocalsave = now;
                    this.saveLocal();
                }
            }, localfrequency * 1000);
        }
    }

    lastimagesave: any;
    startImageSave(getImage: Function, frequency: number) {
        this.lastimagesave = new Date().getTime();
        setInterval(() => {
            if (document.hasFocus() && this.currentlySaving) {
                if (!this.projectid || !this.engine) {
                    this.currentlySaving = false;
                    return console.error("You can't update image online without a projectid and engine");
                }
                let now = new Date().getTime();
                // Avoid sending a lot of request when focus is back on window for instance
                if (now - this.lastimagesave < frequency * 800) return;
                this.lastimagesave = now;
                getImage((image) => {
                    this.uploadImage(image);
                });
            }
        }, frequency * 1000);
    }

    errorshown = false;
    save() {
        this.saveOnlineAndLocal((saved) => {
            if (!saved) {
                this.errorshown = true;
                toastr.error('We currently have difficulties saving your project 😱, we will try again later 🕵️');
            } else if (this.errorshown) {
                this.errorshown = false;
                toastr.success('We manage to save your project again 👨‍🔧, you are good to go!');
            }
        });
    }

    lastexport = {};
    saveOnlineAndLocal(callback: Function) {
        let projectJson = this.undo.getProjectJson();
        // Nothing has changed and previus saved has worked
        if (isEqual(projectJson, this.lastexport) && this.saved) {
            return callback(true);
        }
        this.saveLocal();
        this.saveOnline(projectJson, callback)
        this.lastexport = cloneDeep(projectJson);
    }

    setSavingLocal(savingLocal: boolean) {
        this.savingLocal = savingLocal;
    }

    saveLocal() {
        if (!this.savingLocal) return;
        let projectJson = this.undo.getProjectJson();
        let project: any = {};
        project.json = projectJson;
        project.name = this.name;
        project.engine = this.engine;
        if (this.projectid) project.id = this.projectid;
        Cookies.set('naker_' + this.engine, JSON.stringify(project), { expires: 7 });
    }

    saved = false;
    failednumber = 0;
    saveOnline(json: any, callback: Function) {
        if (!this.engine) return;
        this.api.post(this.engine + '/save', { id: this.projectid, }, { body: json }, (data) => {
            if (data.success) console.log('project successfully saved online');
            this.saved = data.success;
            callback(data.success);
            if (data.success) this.failednumber = 0;
            else this.failednumber++;
            if (this.failednumber > 3) this.error("Error while saving your project");
        });
    }

    uploadImage(image: string, callback?: Function) {
        var fd = new FormData();
        fd.append("image", image);
        const header = { "X-Requested-With": "XMLHttpRequest", "Content-Type": "multipart/form-data" };
        this.api.post(this.engine + '/image', { id: this.projectid }, { body: fd, header: header }, (data) => {
            if (callback) callback(data.success, data.image);
        });
    }

    error(text: string) {
        toastr.error('🤷 ' + text + ', you will be redirected to your dashboard');
        setTimeout(() => {
            window.location.assign('/dashboard/projects');
        }, 5000);
    }

    getSave() {
        return this.saving;
    }

    getApiUrl() {
        return this.apiurl;
    }

    getSentry() {
        return this.sentry;
    }

    isProjectSaved () {
        return (this.projectid)? true : false;
    }

    getProjectId() {
        return this.projectid;
    }

    getEngine() {
        return this.engine;
    }

    getRedirect() {
        return this.redirect;
    }
}
