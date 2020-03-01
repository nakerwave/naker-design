import { Api, Token } from './api';
import { Spy } from './spy';
import { Undo, ProjectSavedOptions } from './undo';

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
    designer: string;

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
            this.stopOnlineSaving();
            this.sendDisconnectToListeners();
        };
        this.checkProjectId();

        document.addEventListener('mouseout', (evt) => {
            if (evt.toElement == null && evt.relatedTarget == null) {
                if (this.project.id) this.saveOnlineAndLocal(() => { });
            }
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
            let projectJson = this.undo.getProjectJson();
            this.saveLocal(projectJson);
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

    loadUser(callback: Function) {
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
    saveListeners: Array<Function> = [];
    projectListeners: Array<Function> = [];
    on(event: 'connect'|'disconnect'|'save'|'project', funct: Function) {
        if (event == 'connect') this.connectListeners.push(funct);
        if (event == 'disconnect') this.disconnectListeners.push(funct);
        if (event == 'save') this.saveListeners.push(funct);
        if (event == 'project') this.projectListeners.push(funct);
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

    sendSaveToListeners() {
        for (let i = 0; i < this.saveListeners.length; i++) {
            this.saveListeners[i]();
        }
    }

    sendProjectToListeners(project: ProjectSavedOptions) {
        for (let i = 0; i < this.saveListeners.length; i++) {
            this.projectListeners[i](project);
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
                this.project.id = next;
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

    setProjectId(projectId:string) {
        this.project.id = projectId;
        history.pushState({}, null, '/' + this.engine + '/' + this.project.id);
    }

    loadProject(callback: Function) {
        let cookie = Cookies.get('naker_' + this.engine);
        let cookieParsed;
        if (cookie) cookieParsed = JSON.parse(cookie);

        // If no id in url but one in cookie saved, we take it
        if (!this.project.id) {
            if (cookieParsed && cookieParsed.id) {
                this.setProjectId(cookieParsed.id);
            }
        // If id in url but do not match with cookie saved, we ignore bad cookie
        } else if (cookieParsed && (this.engine != cookieParsed.engine || this.project.id != cookieParsed.id)) {
            cookieParsed = null;
        }

        // We make sure project exist in the base
        if (this.project.id && this.saving) {
            this.api.get(this.engine, { id: this.project.id }, (data) => {
                if (data.success !== false) {
                    // We don't save engine in database
                    if (!data.engine) data.engine = this.engine;
                    // Cookie will always have the most recent data
                    if (cookieParsed) this.projectFound(callback, cookieParsed);
                    else this.projectFound(callback, data);
                } else {
                    this.setProjectId('');
                    if (cookieParsed) this.projectFound(callback, cookieParsed);
                    else this.projectFound(callback, {});
                }
            });
        } else {
            this.projectFound(callback, cookieParsed);
        }
    }

    project: ProjectSavedOptions = {};
    projectFound(callback: Function, project: ProjectSavedOptions) {
        callback(project);
        this.setProject(project);
        this.sendProjectToListeners(project);

        // Start auto save after get project to make sure we don't save empty project
        this.startLocalSaving(5);
        if (project && this.project.id) this.startOnlineSaving(30);
    }

    createNew(callback?: Function) {
        if (!this.saving) return;
        this.api.post(this.engine + '/new', {name:'New '+ this.engine}, {}, (data) => {
            if (data.success) {
                this.setProjectId(data.id);
                this.sendConnectToListeners(this.user);
                this.startOnlineSaving(30); 
                this.projectFound(callback, data);
            } else {
                toastr.error('🤷 Oups, there was an error while saving your project');
                this.projectFound(callback, {});
            }
        });
    }

    setProject(project: ProjectSavedOptions) {
        this.project = project;
    }

    setWaterMark(waterMark: boolean) {
        this.project.waterMark = waterMark;
    }

    setWebsiteUrl(setWebsiteUrl: string) {
        this.project.websiteUrl = setWebsiteUrl;
    }

    saveProjectName(name: string) {
        if (!this.engine) return;
        this.api.post(this.engine + '/name', { id: this.project.id, name: name }, {}, (data) => {
            if (!data.success) {
                toastr.error('🤷 Oups, there was an error while saving the new name');
            } else {
                this.project.name = name;
                let projectJson = this.undo.getProjectJson();
                this.saveLocal(projectJson);
            }
        });
    }

    lastsave: any;
    lastlocalsave: any;
    savingInterval: any;
    startLocalSaving(localfrequency: number) {
        setInterval(() => {
            if (document.hasFocus()) {
                let now = new Date().getTime();
                if (now - this.lastlocalsave < localfrequency * 800) return;
                this.lastlocalsave = now;
                let projectJson = this.undo.getProjectJson();
                this.saveLocal(projectJson);
            }
        }, localfrequency * 1000);
    }

    onlineFrequency: number;
    startOnlineSaving(frequency: number) {
        this.onlineFrequency = frequency;
        this.lastsave = new Date().getTime();
        this.savingInterval = setInterval(() => {
            if (document.hasFocus()) {
                if (!this.project.id || !this.engine) {
                    this.stopOnlineSaving();
                    return console.error("You can't save project online without a projectId and engine");
                }
                this.save();
                if (this.getThumbnailImage) {
                    this.getThumbnailImage((image) => {
                        this.uploadImage(image);
                    });
                }
            }
        }, frequency * 1000);
    }

    stopOnlineSaving() {
        clearInterval(this.savingInterval);
    }

    setThumbnailFunction(getImage: Function) {
        this.getThumbnailImage = getImage;
    }

    lastimagesave: any;
    savingImageInterval: any;
    getThumbnailImage: Function;

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
        this.saveLocal(projectJson);
        this.saveOnline(projectJson, callback)
        this.lastexport = cloneDeep(projectJson);
    }

    setSavingLocal(savingLocal: boolean) {
        this.savingLocal = savingLocal;
    }

    setSavingOnline(saving: boolean) {
        this.saving = saving;
    }

    saveLocal(json) {
        if (!this.savingLocal) return;
        let project: any = {};
        project.json = json;
        project.name = this.project.name;
        project.waterMark = this.project.waterMark;
        project.websiteUrl = this.project.websiteUrl;
        project.engine = this.engine;
        if (this.project.id) project.id = this.project.id;
        Cookies.set('naker_' + this.engine, JSON.stringify(project), { expires: 7 });
    }

    saved = false;
    failednumber = 0;
    saveOnline(json: any, callback: Function) {
        if (!this.lastsave) return callback(false);
        if (!this.engine || !this.saving) return callback(false);
        // Avoid sending a lot of request when focus is back on window for instance
        // Maximum one save every 5 seconds
        let now = new Date().getTime();
        if (now - this.lastsave < 5000) return callback(true);
        this.lastsave = now;
        this.requestSaveOnline(json, callback);
    }

    requestSaveOnline(json: any, callback: Function) {
        this.sendSaveToListeners();        
        this.api.post(this.engine + '/save', { id: this.project.id }, { body: json }, (data) => {
            if (data.success) console.log('project successfully saved online');
            this.saved = data.success;
            this.checkError(data.success);
            callback(data.success);
        });
    }

    uploadImageUrl;
    uploadImage(image: string, callback?: Function) {
        var fd = new FormData();
        fd.append("image", image);
        const header = { "X-Requested-With": "XMLHttpRequest", "Content-Type": "multipart/form-data" };
        let uploadImageUrl = (this.uploadImageUrl) ? this.uploadImageUrl : this.engine + '/image';
        this.api.post(uploadImageUrl, { id: this.project.id }, { body: fd, header: header }, (data) => {
            if (callback) callback(data.success, data.image);
        });
    }

    checkError(success: boolean) {
        if (success) this.failednumber = 0;
        else this.failednumber++;

        if (this.failednumber > 3) {
            this.failednumber = 0;
            this.errorshown = true;
            toastr.error('We currently have difficulties saving your project 😱, we will try again later 🕵️');
        } else if (this.errorshown) {
            this.errorshown = false;
            toastr.success('We manage to save your project again 👨‍🔧, you are good to go!');
        }
    }

    error(text: string) {
        toastr.error('🤷 ' + text + ', you will be redirected to your dashboard');
        if (this.getRedirect()) {
            setTimeout(() => {
                window.location.assign('/dashboard/' + this.engine);
            }, 5000);
        }
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
        return (this.project.id)? true : false;
    }

    getProjectId() {
        return this.project.id;
    }

    getProject():ProjectSavedOptions {
        return this.project;
    }

    getUser(): User {
        return this.user;
    }

    getEngine() {
        return this.engine;
    }

    getRedirect() {
        return this.redirect;
    }
}
