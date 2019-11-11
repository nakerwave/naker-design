import cloneDeep from 'lodash/cloneDeep';
import defaultsDeep from 'lodash/defaultsDeep';
import isEqual from 'lodash/isEqual';
import last from 'lodash/last';
import head from 'lodash/head';
import merge from 'lodash/merge';
import transform from 'lodash/transform';
import isPlainObject from 'lodash/isPlainObject';

import hotkeys from 'hotkeys-js';

interface Change {
    back: Object
    forward: Object
}

export class Undo {

    presentState: any = {};
    pastChange: Array<Change> = [];
    futureChange: Array<Change> = [];

    listenShortcut() {
        hotkeys('command+z,ctrl+z', (event, param) => {
            this.back();
        });

        hotkeys('command+shift+z,ctrl+shift+z', (event, param) => {
            this.forward();
        });
    }

    saveState() {
        let json = this.getProjectJson();
        this.presentState = cloneDeep(json);
    }

    pushState() {
        let json = this.getProjectJson();
        let projectJson = cloneDeep(json);
        if (isEqual(projectJson, this.presentState)) return; // Nothing has Change
        let backChange = this.getDifference(this.presentState, projectJson);
        let forwardChange = this.getDifference(projectJson, this.presentState);
        // Set default value to null in case new values added so that we can go back to null/undefined value

        let backDefault = this.setNullValues(backChange);
        let forwardDefault = this.setNullValues(forwardChange);
        // clone otherwise back object will match with forward object
        backChange = cloneDeep(defaultsDeep(backChange, forwardDefault));
        forwardChange = cloneDeep(defaultsDeep(forwardChange, backDefault));

        // console.log({back:backChange, forward:forwardChange});
        this.pastChange.push({ back: backChange, forward: forwardChange });
        this.futureChange = [];
        this.presentState = projectJson;
        this.sendToSaveListeners(this.presentState);
    }

    getProjectJson() { }

    back() {
        if (this.pastChange.length != 0) {
            let past = last(this.pastChange);
            // console.log(past.back)
            this.futureChange.unshift(this.pastChange.pop());
            let newState = merge(this.presentState, past.back);
            let backState = this.getDifference(newState, past.forward);
            this.presentState = backState;
            this.sendToUndoListeners(past.back, this.presentState);
        } else {
            this.sendToUndoListeners(false, this.presentState);
        }
    }

    forward() {
        if (this.futureChange.length != 0) {
            let future = head(this.futureChange);
            // console.log(future.forward)
            this.pastChange.push(this.futureChange.shift());
            let newState = merge(this.presentState, future.forward);
            let forwardState = this.getDifference(newState, future.back);
            this.presentState = forwardState;
            this.sendToRedoListeners(future.forward, this.presentState);
        } else {
            this.sendToRedoListeners(false, this.presentState);
        }
    }

    limitAccuracy(number: number, length: number) {
        if (length == 1) return Math.round(number);
        let powLength = Math.pow(10, length);
        return Math.round(number * powLength) / powLength;
    }

    getDifference(object, base) {
        let Changes = (object, base) => {
            return transform(object, (result, value, key) => {
                if (!isEqual(value, base[key])) {
                    result[key] = (isPlainObject(value) && isPlainObject(base[key])) ? Changes(value, base[key]) : value;
                }
            });
        }
        return Changes(object, base);
    }

    setNullValues(object) {
        let Changes = (object) => {
            return transform(object, (result, value, key) => {
                // Keep null and not undefined or it won't be considered by jsontocontent when back or forward
                result[key] = (isPlainObject(value)) ? Changes(value) : null;
            });
        }
        return Changes(object);
    }

    _changeListeners: Array<Function> = [];
    _saveListeners: Array<Function> = [];
    _undoListeners: Array<Function> = [];
    _redoListeners: Array<Function> = [];
    on(event: 'change' | 'save' | 'undo' | 'redo', callback: Function) {
        if (event == 'change') this._changeListeners.push(callback);
        if (event == 'save') this._saveListeners.push(callback);
        if (event == 'undo') this._undoListeners.push(callback);
        if (event == 'redo') this._redoListeners.push(callback);
    }

    sendToChangeListeners(change: any, newState: any) {
        for (let i = 0; i < this._changeListeners.length; i++) {
            this._changeListeners[i](change, newState);
        }
    }

    sendToSaveListeners(newState: any) {
        for (let i = 0; i < this._saveListeners.length; i++) {
            this._saveListeners[i](newState);
        }
    }

    sendToUndoListeners(change: any, newState: any) {
        for (let i = 0; i < this._undoListeners.length; i++) {
            this._undoListeners[i](change, newState);
        }
        this.sendToChangeListeners(change, newState);
    }

    sendToRedoListeners(change: any, newState: any) {
        for (let i = 0; i < this._redoListeners.length; i++) {
            this._redoListeners[i](change, newState);
        }
        this.sendToChangeListeners(change, newState);
    }
}