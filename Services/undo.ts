import cloneDeep from 'lodash/cloneDeep';
import defaultsDeep from 'lodash/defaultsDeep';
import isEqual from 'lodash/isEqual';
import last from 'lodash/last';
import head from 'lodash/head';
import merge from 'lodash/merge';
import transform from 'lodash/transform';
import isPlainObject from 'lodash/isPlainObject';
import isObject from 'lodash/isObject';
import isArray from 'lodash/isArray';
import mapValues from 'lodash/mapValues';

import hotkeys from 'hotkeys-js';

export enum UndoEvent {
    Change,
    Save,
    Undo,
    Redo,
}

interface undoObserver {
    name: UndoEvent,
    funct: Function,
}

export interface ProjectSavedOptions {
    id?: string,
    name?: string,
    waterMark?: boolean,
    pushQuality?: boolean,
    websiteUrl?: string,
}

interface Change {
    back: Array<any>
    forward: Array<any>
}

export abstract class Undo<T> {

    presentState: any = {};
    pastChange: Array<Change> = [];
    futureChange: Array<Change> = [];

    abstract getSceneJson(): T;
    abstract getSceneWithAssetJson(): T;
    abstract getFullProjectJson(): T;

    constructor() {
        hotkeys('command+z,ctrl+z,⌘+z', (event, param) => {
            this.back();
        });

        hotkeys('command+⇧+z,ctrl+⇧+z,⌘+⇧+z', (event, param) => {
            this.forward();
        });
    }

    saveState() {
        let json:T = this.getSceneWithAssetRoundedJson();
        this.presentState = cloneDeep(json);
    }

    pushState() {
        let json = this.getSceneWithAssetRoundedJson();
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
        this.sendToObserver(UndoEvent.Save, forwardChange, this.presentState)
    }

    getSceneWithAssetRoundedJson():T {
        return this.limitObjectAccuracy(this.getSceneWithAssetJson());
    }

    getFullProjectRoundedJson(): T {
        return this.limitObjectAccuracy(this.getFullProjectJson());
    }

    getSceneRoundedJson(): T {
        return this.limitObjectAccuracy(this.getSceneJson());
    }

    back() {
        if (this.pastChange.length != 0) {
            let past = last(this.pastChange);
            // console.log(past.back);
            this.futureChange.unshift(this.pastChange.pop());
            let newState = merge(cloneDeep(past.back), this.presentState);
            this.presentState = this.getDifference(newState, past.forward);
            this.sendToObserver(UndoEvent.Undo, past.back, this.presentState)
            this.sendToObserver(UndoEvent.Change, past.back, this.presentState)
            return true;
        } else {
            return false;
        }
    }

    forward() {
        if (this.futureChange.length != 0) {
            let future = head(this.futureChange);
            // console.log(future.forward)
            this.pastChange.push(this.futureChange.shift());
            let newState = merge(this.presentState, future.forward);
            this.presentState = this.getDifference(newState, future.back);
            this.sendToObserver(UndoEvent.Redo, future.forward, this.presentState)
            this.sendToObserver(UndoEvent.Change, future.forward, this.presentState)
            return true;
        } else {
            return false;
        }
    }

    limitObjectAccuracy(object: T) {
        return this.mapValuesDeep(object, (a) => {
            if (typeof a == 'number') return this.limitAccuracy(a, 2);
            else return a;
        });
    }

    mapValuesDeep(v, callback: Function) {
        if (isObject(v) && !isArray(v)) return mapValues(v, v => this.mapValuesDeep(v, callback));
        else return callback(v);
    }

    limitAccuracy(number: number, length: number) {
        if (length == 1) return Math.round(number);
        let powLength = Math.pow(10, length);
        return Math.round(number * powLength) / powLength;
    }

    getDifference(object: T, base: T) {
        let Changes = (object, base) => {
            return transform(object, (result, value, key) => {
                if (!isEqual(value, base[key])) {
                    if (isPlainObject(value) && isPlainObject(base[key])) {
                        result[key] = Changes(value, base[key]);
                    } else if (isArray(value) && isArray(base[key])) {
                        result[key] = [];
                        for (let i = 0; i < value.length; i++) {
                            // Can't do that as value[i] not always an object
                            // result[key][i] = Changes(value[i], base[key][i]);
                            if (!isEqual(value[i], base[key][i])) {
                                if (isPlainObject(value[i]) && isPlainObject(base[key][i])) {
                                    result[key][i] = Changes(value[i], base[key][i]);
                                } else {
                                    result[key][i] = value[i];
                                }
                            }
                        }
                    } else {
                        result[key] = value;
                    }
                }
            });
        }
        return Changes(object, base);
    }

    setNullValues(object: T) {
        let Changes = (object) => {
            return transform(object, (result, value, key) => {
                // Keep null and not undefined or it won't be considered by jsontocontent when back or forward
                result[key] = (isPlainObject(value)) ? Changes(value) : null;
            });
        }
        return Changes(object);
    }

    observers: Array<undoObserver> = [];
    on(event: undoObserver["name"], funct: (change: T, state: T) => void, first?: boolean) {
        let newObserver: undoObserver = {
            name: event,
            funct: funct,
        };
        if (first) {
            this.observers.unshift(newObserver);
        } else {
            this.observers.push(newObserver);
        }
    }

    sendToObserver(event: undoObserver["name"], change: T, newState: T) {
        for (let i = 0; i < this.observers.length; i++) {
            let observer = this.observers[i];
            if (observer.name == event) observer.funct(change, newState);
        }
    }
}