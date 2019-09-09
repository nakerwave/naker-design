
import { Api } from './api';
import { Spy } from './spy';

import toastr from 'toastr';
import isEqual from 'lodash/isEqual';
import cloneDeep from 'lodash/cloneDeep';
import Cookies from 'js-cookie';

export class Session {

    saveBeforeUnload = false;
    api: Api;
    spy: Spy;

    subDomain: string;
    engine: 'Story' | 'Back' | 'Form';
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
            sentry: true
        },
        staging: {
            apiurl: 'https://naker-backend-prod.herokuapp.com/',
            saving: true,
            redirect: true,
            intercom: false,
            sentry: false
        },
        test: {
            apiurl: 'https://naker-backend.herokuapp.com/',
            saving: true,
            redirect: false,
            intercom: false,
            sentry: false
        },
        development: {
            apiurl: 'http://localhost:3000/',
            saving: true,
            redirect: true,
            intercom: false,
            sentry: false
        },
    };

    apiurl: string;
    saving: boolean;
    redirect: boolean;
    intercom: boolean;
    sentry: boolean;

    constructor(api: Api, spy: Spy) {
        this.api = api;
        this.spy = spy;

        let subDomain = api.getSubdomain();
        if (!subDomain) this.subDomain = 'development';
        else this.subDomain = subDomain;

        this.apiurl = this.environments[this.subDomain].apiurl;
        this.saving = this.environments[this.subDomain].saving;
        this.redirect = this.environments[this.subDomain].redirect;
        this.intercom = this.environments[this.subDomain].intercom;
        this.sentry = this.environments[this.subDomain].sentry;

        api.setHost(this.apiurl);
        this.getEngineAndId();

        // getSubDomain allows testing on localhost
        window.addEventListener('beforeunload', () => {
            if (this.saveBeforeUnload) this.save();
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
    getEngineAndId() {
        let url = window.location.href;
        let urlArray = url.split('/');
        for (let i = 0; i < urlArray.length; i++) {
            let first = urlArray[i];
            let next = urlArray[i + 1];
            if (this.engineList.indexOf(first) != -1) {
                this.engine = first;
                this.projectid = next;
            }
        }

        if (this.engine) {
            this.spy.setEngine(this.spyPrefix[this.engine]);
            if (this.sentry) this.spy.startSentry(this.sentryIds[this.engine]);

            var in10Minutes = 1 / (24 * 6);
            Cookies.set('last_engine', this.engine, {
                expires: in10Minutes
            });
        }
    }

    setProjectId(projectid) {
        this.projectid = projectid;
        history.pushState({}, null, '/' + this.engine + '/' + this.projectid);
    }

    getProject(callback: Function) {
        let cookie = Cookies.get('naker_' + this.engine);
        let cookieParsed;
        if (cookie) cookieParsed = JSON.parse(cookie);

        // If no id in url but one in cookie saved, we take it
        if (cookieParsed && cookieParsed.id) {
            if (!this.projectid) {
                this.setProjectId(cookieParsed.id);
            }
        }

        if (this.projectid) {
            this.api.get(this.engine, { id: this.projectid }, (data) => {
                if (data.success !== false) {
                    callback(data);
                } else {
                    this.setProjectId('');
                    callback(cookieParsed);
                }
            });
        } else {
            callback(cookieParsed);
        }
    }

    createNew(callback?: Function) {
        if (!this.engine) return;
        this.api.post(this.engine + '/new', {}, {}, (data) => {
            if (data.success) {
                this.setProjectId(data.id);
                this.saving = true;
                this.save();
                toastr.success('👍 Project created! For now on, we will automatically save it for you');
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
                toastr.success('Name updated 👍');
            }
        });
    }

    lastsave: any;
    lastlocalsave: any;
    startAutoSave(getProjectJson: Function, frequency: number, localfrequency?: number) {
        this.lastsave = new Date().getTime();
        this.getProjectJson = getProjectJson;

        setInterval(() => {
            if (document.hasFocus() && this.saving) {
                if (!this.projectid || !this.engine) {
                    this.saving = false;
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
        let projectJson = this.getProjectJson();
        // Nothing has changed and previus saved has worked
        if (isEqual(projectJson, this.lastexport) && this.saved) {
            return callback(true);
        }
        this.saveLocal();
        this.saveOnline(projectJson, callback)
        this.lastexport = cloneDeep(projectJson);
    }

    saveLocal() {
        let projectJson = this.getProjectJson();
        let project: any = {};
        project.json = projectJson;
        if (this.projectid) project.id = this.projectid;
        Cookies.set('naker_' + this.engine, JSON.stringify(project), { expires: 7 });
    }

    saved = false;
    failednumber = 0;
    saveOnline(json: any, callback: Function) {
        if (!this.engine) return;
        this.api.post(this.engine + '/save', { id: this.projectid, }, { body: json }, (data) => {
            if (data.success) console.log('project saved online successfully');
            this.saved = data.success;
            callback(data.success);
            if (data.success) this.failednumber = 0;
            else this.failednumber++;
            if (this.failednumber > 3) this.error("Error while saving your project");
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

    getProjectId() {
        return this.projectid;
    }

    getRedirect() {
        return this.redirect;
    }
}
