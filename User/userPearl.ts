import { Api } from '../Services/api';
import { Session } from '../Services/session';

import toastr from 'toastr';

declare let nakerpearl: any;

export class UserPearl {
    
    pearl: any;
    model: any;
    light: any;
    session: Session;
    api: Api;
    metallicroughness = 0.4;

    constructor(container: HTMLElement, session: Session) {
        this.session = session;
        this.api = session.api;

        const script = document.createElement("script");
        // script.src = "https://harbor-test.naker.io/pearl/v1.0.1/viewer.js";
        script.src = "https://d23jutsnau9x47.cloudfront.net/pearl/v1.0.3/viewer.js";
        
        script.async = true;
        document.body.appendChild(script);
        script.addEventListener('load', () => {
            this.createPearl(container);
        });
    }
    
    createPearl(container: HTMLElement) {
        this.pearl = nakerpearl.render({ container: container, model: 'pearl', modelFollowMouseRapidity: 2, waterMark: false, offscreen: false }, (pearl) => {
            this.pearl = pearl;
            this.model = pearl.model;
            this.light = pearl.light;
            this.light = pearl.light;

            let user = this.session.user;
            if (user && user.pearl != undefined) {
                if (user.pearl.length != 0) {
                    pearl.model.pattern.mesh._setPositions(user.pearl);
                    let color = user.pearlcolor;
                    let pearlColor = (color && color.length != 0) ? color : [255, 255, 255];
                    this.setColor(pearlColor);
                }
            } else {
                this.setIcoSphere();
            }
            pearl.model.pattern.setMaterialProperties({ roughness: this.metallicroughness, metallic: this.metallicroughness });
            pearl.model.setScale({ x: 0.5, y: 0.5, z: 0.5 });
            this.updateRender();
        });
    
        this.model = this.pearl.model;
        this.light = this.pearl.light;
    }

    setIcoSphere() {
        if (!this.model) return;
        this.model.pattern.mesh._setIcoSphere();
        this.setColor(this.session.engineColor);
        this.updateRender();
    }
    
    setColor(color: Array<number>) {
        if (!this.light) return; 
        this.light.setColor(color);
        this.light.setIntensity(1.5);
        this.light.show();
        this.updateRender();
    }

    updatePearl(data?: Array<number>) {
        if (!this.model) return; 
        if (data) this.model.pattern.mesh._setPositions(data);
        else this.model.pattern.mesh._update(10);
        this.model.show();
        this.updateRender();
    }

    savePearl(success:boolean, callback?:Function) {
        if (!this.model) return; 
        let pearlMesh = this.model.pattern.mesh;
        let newPoints = pearlMesh._getPositions();
        let pearlPoints = JSON.stringify(newPoints);
        
        this.pearl.system.takeScreenshot({ width: 200, height: 200 }, (image) => {
            var fd = new FormData();
            fd.append("image", image);
            fd.append("points", pearlPoints);

            let user = this.session.user;
            const header = { "X-Requested-With": "XMLHttpRequest", "Content-Type": "multipart/form-data" };

            if (!user.pearlcolor || (user.pearlcolor && user.pearlcolor.length == 0)) user.pearlcolor = [0, 72, 255];
            this.api.post('user/setpearl', { id: user.id, color: user.pearlcolor }, { body: fd, header: header }, (data) => {
                this.setColor(user.pearlcolor);
                if (success) {
                    if (data.success) {
                        this.session.user.pearl = newPoints;
                        this.session.user.pearl = user.pearlcolor;
                        toastr.success('Good, your pearl has been updated 😍');
                    } else {
                        toastr.error('Can not update your pearl for now 😕');
                    }
                }
                if (callback) callback(this.session.user);
            });
        });
    }

    updateRender() {
        this.pearl.system.launchRender();
        setTimeout(() => {
            this.pearl.system.stopRender();
        }, 1000);
    }

}