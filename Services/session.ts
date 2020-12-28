import { Api, Token } from './api';
import { Spy } from './spy';
import { Undo, UndoEvent, ProjectSavedOptions } from './undo';

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
    undo: Undo<any>;

    subDomain: 'app' | 'staging' | 'test' | 'cruise' | 'development';
    engine: 'studio' | 'story' | 'back' | 'form';
    designer: string;

    environments = {
        app: {
            apiurl: 'https://naker-backend-prod.herokuapp.com/',
            saving: true,
            redirect: true,
            intercom: true,
            sentry: true,
            admin: false, // Need to be admin to log and enter
            debug: false,
        },
        staging: {
            apiurl: 'https://naker-backend-prod.herokuapp.com/',
            saving: true,
            redirect: true,
            intercom: false,
            sentry: false,
            admin: true,
            debug: true,
        },
        test: {
            apiurl: 'https://naker-backend.herokuapp.com/',
            saving: true,
            redirect: false,
            intercom: false,
            sentry: false,
            admin: true,
            debug: true,
        },
        cruise: {
            apiurl: 'https://naker-backend.herokuapp.com/',
            saving: false,
            redirect: false,
            intercom: false,
            sentry: false,
            admin: false,
            debug: true,
        },
        development: {
            apiurl: 'http://localhost:3000/',
            saving: false,
            redirect: true,
            intercom: false,
            sentry: false,
            admin: true,
            debug: true,
        },
    };

    apiurl: string;
    saving: boolean;
    savingLocal = true;
    redirect: boolean;
    intercom: boolean;
    sentry: boolean;
    admin: boolean;
    debug: boolean;

    constructor(engine: 'studio' | 'story' | 'back' | 'form', api: Api, spy: Spy, undo: Undo<any>) {
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
        this.debug = this.environments[this.subDomain].debug;

        api.setHost(this.apiurl);
        api.onDisconnected = () => {
            this.setProjectId('');
            this.stopOnlineSaving();
            this.sendDisconnectToListeners();
        };
        this.checkProjectId();

        document.addEventListener('mouseout', (evt) => {
            if (evt.toElement == null && evt.relatedTarget == null) {
                // Make sure project loaded before save when mouseout
                if (this.projectId && this.savingInterval) this.saveOnlineAndLocal(() => { });
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

        this.undo.on(UndoEvent.Save, () => {
            let projectJson = this.undo.getFullProjectRoundedJson();
            this.saveLocal(projectJson);
        });
    }

    engineList = ['back', 'form', 'story', 'studio'];
    sentryIds = {
        studio: 'https://64462014944f48b3bc58327feb758f7c@sentry.io/1522591',
        story: 'https://64462014944f48b3bc58327feb758f7c@sentry.io/1522591',
        back: 'https://7e62b4e539db4d2ba599726125f742e2@sentry.io/1539712',
        // form: 'https://7e62b4e539db4d2ba599726125f742e2@sentry.io/1539712'
    };
    spyPrefix = {
        studio: 'NST',
        story: 'NS',
        back: 'NB',
        form: 'NF'
    };
    engineColor: Array<number>;
    engineColors = {
        studio: [102, 51, 255],
        story: [0, 153, 255],
        back: [255, 8, 114],
        form: [0, 204, 102],
    };

    setEngine(engine: 'studio' | 'story' | 'back' | 'form') {
        this.engine = engine;
        this.engineColor = this.engineColors[this.engine]
    }

    ///////////////////////// USER /////////////////////////
    user: User;
    setUser(user: User) {
        this.user = user;
        this.user.id = user._id;
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
        this.spy.track("Platform Signup");
    }

    connectListeners: Array<Function> = [];
    disconnectListeners: Array<Function> = [];
    saveListeners: Array<Function> = [];
    projectListeners: Array<Function> = [];
    on(event: 'connect' | 'disconnect' | 'save' | 'project', funct: Function) {
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
        for (let i = 0; i < this.projectListeners.length; i++) {
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
                this.projectId = next;
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

    setProjectId(projectId: string) {
        this.projectId = projectId;
        history.pushState({}, null, '/' + this.engine + '/' + this.projectId);
    }

    loadProject(callback: Function) {
        let cookie = Cookies.get('naker_' + this.engine);
        let cookieParsed: any = {};
        if (cookie) cookieParsed = JSON.parse(cookie);

        // If no id in url but one in cookie saved, we take it
        if (!this.projectId) {
            if (cookieParsed && cookieParsed.id) {
                this.setProjectId(cookieParsed.id);
            }
            // If id in url but do not match with cookie saved, we ignore bad cookie
        } else if (cookieParsed && (this.engine != cookieParsed.engine || this.projectId != cookieParsed.id)) {
            cookieParsed = null;
        }

        // We make sure project exist in the base
        if (this.projectId && this.saving) {
            this.api.get(this.engine, { id: this.projectId }, (data) => {
                if (data.success !== false) {
                    // We don't save engine in database
                    if (!data.engine) data.engine = this.engine;
                    // Cookie will always have the most recent json
                    if (cookieParsed) data.json = cookieParsed.json;
                    this.projectFound(data, callback);
                } else {
                    this.setProjectId('');
                    if (cookieParsed) this.projectFound(cookieParsed, callback);
                    else this.projectFound({}, callback);
                }
            });
        } else {
            this.projectFound(cookieParsed, callback);
        }
    }

    projectId: string;
    projectFound(project: ProjectSavedOptions, callback?: Function) {
        let clonedProject = cloneDeep(project);

        this.lastProjectChange = clonedProject;
        this.undo.setProjectOptions(clonedProject);
        this.sendProjectToListeners(clonedProject);
        if (callback) callback(clonedProject);

        // Start auto save after get project to make sure we don't save empty project
        this.startLocalSaving(5);
        if (project && this.projectId) this.startOnlineSaving(30);
    }

    createNew(callback?: Function) {
        if (!this.saving) return;
        this.api.post(this.engine + '/new', { name: 'New ' + this.engine }, {}, (data) => {
            if (data.success) {
                this.setProjectId(data.id);
                this.sendConnectToListeners(this.user);
                this.startOnlineSaving(30);
                this.projectFound(data, callback);
            } else {
                toastr.error('🤷 Oups, there was an error while saving your project');
                this.projectFound({}, callback);
            }
        });
    }

    saveProjectName(name: string) {
        if (!this.engine) return;
        this.updateProjectData({ name: name }, (success) => {
            if (!success) {
                toastr.error('🤷 Oups, there was an error while saving the new name');
            } else {
                this.undo.setProjectOption('name', name);
                let projectJson = this.undo.getFullProjectRoundedJson();
                this.saveLocal(projectJson);
            }
        });
    }

    updateProjectData(update, callback?: Function) {
        update.id = this.projectId;
        this.api.post(this.engine + '/update', update, {}, (data) => {
            if (callback) callback(data.success);
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
                let projectJson = this.undo.getFullProjectRoundedJson();
                this.saveLocal(projectJson);
            }
        }, localfrequency * 1000);
    }

    onlineFrequency: number;
    startOnlineSaving(frequency: number) {
        this.onlineFrequency = frequency;
        this.lastsave = new Date().getTime();
        this.lastTimeThumbnailSaved = new Date().getTime();

        this.stopOnlineSaving();
        this.savingInterval = setInterval(() => {
            if (document.hasFocus()) {
                if (!this.projectId || !this.engine) {
                    this.stopOnlineSaving();
                    return console.error("You can't save project online without a projectId and engine");
                }
                this.save();
            }
        }, frequency * 1000);
    }

    stopOnlineSaving() {
        clearInterval(this.savingInterval);
    }

    lastimagesave: any;
    savingImageInterval: any;
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
        let projectJson = this.undo.getFullProjectRoundedJson();
        // Nothing has changed and previus saved has worked
        if (isEqual(projectJson, this.lastexport) && this.saved) {
            return callback(true);
        }

        this.saveLocal(projectJson);
        this.saveOnline(projectJson, callback);
        this.checkProjectDataUpdate();

        this.lastexport = cloneDeep(projectJson);
    }

    lastProjectChange: ProjectSavedOptions = {};
    keytoCheck = ['name', 'waterMark', 'websiteUrl', 'pushQuality'];
    checkProjectDataUpdate() {
        let change: ProjectSavedOptions = {};
        let projectOption = this.undo.getProjectOptions();
        for (let i = 0; i < this.keytoCheck.length; i++) {
            const key = this.keytoCheck[i];
            if (this.lastProjectChange[key] != projectOption[key]) change[key] = projectOption[key];
            this.lastProjectChange[key] = projectOption[key];
        }
        if (Object.keys(change).length != 0) this.updateProjectData(change);
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
        let projectOption = this.undo.getProjectOptions();
        project.name = projectOption.name;
        project.waterMark = projectOption.waterMark;
        project.pushQuality = projectOption.pushQuality;
        project.websiteUrl = projectOption.websiteUrl;
        project.engine = this.engine;
        if (this.projectId) project.id = this.projectId;
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
        if (now - this.lastsave < 5000) return callback(this.saved);
        this.lastsave = now;
        this.requestSaveOnline(json, callback);
    }

    requestSaveOnline(json: any, callback: Function) {
        this.sendSaveToListeners();
        this.api.post(this.engine + '/save', { id: this.projectId }, { body: json }, (data) => {
            if (data.success) console.log('project successfully saved online');
            else console.log('project not successfully saved online');
            this.saved = data.success;
            this.checkError(data.success);
            callback(data.success);
        });
    }

    getThumbnailImage: Function;
    setThumbnailFunction(getImage: Function) {
        this.getThumbnailImage = getImage;
    }

    lastTimeThumbnailSaved = 0;
    saveThumbnail(callback?: Function) {
        // if (this.subDomain == 'development') return;
        let now = new Date().getTime();
        // We save the thumbnail maximum every minute
        if (now - this.lastTimeThumbnailSaved < 60000) {
            if (callback) callback();
            return;
        }
        this.lastTimeThumbnailSaved = now;
        if (this.getThumbnailImage) {
            this.getThumbnailImage((image) => {
                this.uploadImage(image);
                if (callback) callback();
            });
        }
    }

    // For stoy the url is different
    uploadImageUrl: string;
    uploadImage(image: string, callback?: Function) {
        var fd = new FormData();
        fd.append("image", image);
        const header = { "X-Requested-With": "XMLHttpRequest", "Content-Type": "multipart/form-data" };
        let uploadImageUrl = (this.uploadImageUrl) ? this.uploadImageUrl : this.engine + '/image';
        this.api.post(uploadImageUrl, { id: this.projectId }, { body: fd, header: header }, (data) => {
            if (callback) callback(data.success, data.image);
        });
    }

    checkError(success: boolean) {
        if (success) this.failednumber = 0;
        else this.failednumber++;

        if (this.failednumber == 2) {
            this.errorshown = true;
            toastr.error('We currently have difficulties saving your project 😱, we will try again later 🕵️');
        }
        if (this.failednumber == 5) {
            this.errorWithRedirection('Sorry it seems you have been disconnected');
        }
        if (success && this.errorshown) {
            this.errorshown = false;
            toastr.success('We manage to save your project again 👨‍🔧, you are good to go!');
        }
    }

    errorWithRedirection(text: string) {
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

    isProjectSaved() {
        return (this.projectId) ? true : false;
    }

    getProjectId() {
        return this.projectId;
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
