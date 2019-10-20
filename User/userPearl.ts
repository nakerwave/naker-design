import { Api } from '../Services/api';
import { Spy } from '../Services/spy';
import { Session } from '../Services/session';

import toastr from 'toastr';

declare let nakerpearl: any;

export class UserPearl {
    
    pearl: any;
    model: any;
    light: any;
    session: Session;
    api: Api;
    spy: Spy;
    metallicroughness = 0.4;

    constructor(container:HTMLElement, session: Session) {
        this.session = session;
        this.api = session.api;
        this.spy = session.spy;
        
        if (document.readyState === 'complete') {
            this.createPearl(container);
        } else {
            window.addEventListener("load", () => {this.createPearl(container)});
        } 
    }
    
    createPearl(container: HTMLElement) {
        this.pearl = nakerpearl.render({ container: container, model: 'pearl', modelFollowMouseRapidity: 2 }, (pearl) => {
            this.model = pearl.model;
            this.light = pearl.light;

            let user = this.spy.user;
            if (user && user.pearl != undefined) {
                if (user.pearl.length != 0) {
                    pearl.model.pattern.mesh._setPositions(user.pearl);
                    let color = user.pearlcolor;
                    let pearlColor = (color && color.length != 0) ? color : [255, 255, 255];
                    this.setColor(pearlColor);
                }
            } else {
                pearl.model.pattern.mesh._setIcoSphere();
                this.setColor(this.session.engineColor[this.session.engine]);
            }
            pearl.model.pattern.setMaterialProperties({ roughness: this.metallicroughness, metallic: this.metallicroughness });
        });
    
        this.model = this.pearl.model;
        this.light = this.pearl.light;
    }
    
    setColor(color: Array<number>) {
        if (!this.light) return; 
        this.light.setColor(color);
        this.light.setIntensity(1.5);
        this.light.show();
    }

    updatePearl(data?: Array<number>) {
        if (!this.model) return; 
        if (data) this.model.pattern.mesh._setPositions(data);
        else this.model.pattern.mesh._update(10);
        this.model.show();
    }

    savePearl(success:boolean, callback?:Function) {
        if (!this.model) return; 
        let pearlMesh = this.model.pattern.mesh;
        let newPoints = pearlMesh._getPositions();
        let pearlPoints = JSON.stringify(newPoints);
        this.pearl._system.takeScreenshot({ width: 200, height: 200 }, (image) => {
            var fd = new FormData();
            fd.append("image", image);
            fd.append("points", pearlPoints);
            const header = { "X-Requested-With": "XMLHttpRequest", "Content-Type": "multipart/form-data" };
            this.api.post('user/setpearl', { id: this.spy.user.id, color: this.spy.user.pearlcolor }, { body: fd, header: header }, (data) => {
                if (!success) return;
                if (data.success) {
                    this.spy.user.pearl = newPoints;
                    this.spy.user.pearlcolor = this.spy.user.pearlcolor;
                    toastr.success('Good, your pearl has been updated 😍');
                } else {
                    toastr.error('Can not update your pearl for now 😕');
                }
                if (callback) callback(this.spy.user);
            });
        });
    }

}