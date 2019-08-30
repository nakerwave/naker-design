
import cloneDeep from 'lodash/cloneDeep';
import defaultsDeep from 'lodash/defaultsDeep';
import isEqual from 'lodash/isEqual';
import last from 'lodash/last';
import head from 'lodash/head';
import merge from 'lodash/merge';
import transform from 'lodash/transform';
import isObject from 'lodash/isObject';

interface change {
  back:Object
  forward:Object
}

export class Undo {

  presentState:any = {};
  pastChange:Array<change> = [];
  futureChange:Array<change> = [];

  saveState () {
    this.presentState = this.getProjectJson();
  }

  pushState () {
    let projectJson = this.getProjectJson();
    if (isEqual(projectJson, this.presentState)) return; // Nothing has change
    let backchange = this.getDifference(this.presentState, projectJson);
    let forwardchange = this.getDifference(projectJson, this.presentState);
    // Set default value to null in case new values added so that we can go back to null/undefined value
    let backDefault = this.setNullValues(backchange);
    let forwardDefault = this.setNullValues(forwardchange);
    // clone otherwise back object will match with forward object
    backchange = cloneDeep(defaultsDeep(backchange, forwardDefault));
    forwardchange = cloneDeep(defaultsDeep(forwardchange, backDefault));

    // console.log({back:backchange, forward:forwardchange});
    this.pastChange.push({back:backchange, forward:forwardchange});
    this.futureChange = [];
    this.presentState = projectJson;
  }

  getProjectJson () {}

  _back () {
    if (this.pastChange.length != 0) {
      let past = last(this.pastChange);
      // console.log(past.back)
      this.futureChange.unshift(this.pastChange.pop());
      let newState = merge(this.presentState, past.back);
      let backState = this.getDifference(newState, past.forward);
      this.presentState = backState;
      return true;
    } else {
      return false;
    }
  }

  _forward () {
    if (this.futureChange.length != 0) {
      let future = head(this.futureChange);
      // console.log(future.forward)
      this.pastChange.push(this.futureChange.shift());
      let newState = merge(this.presentState, future.forward);
      let forwardState = this.getDifference(newState, future.back);
      this.presentState = forwardState;
      return true;
    } else {
      return false;
    }
  }

  limitAccuracy (number:number, length:number) {
    if (length == 1) return Math.round(number);
    let powLength = Math.pow(10, length);
    return Math.round(number*powLength)/powLength;
  }

  getDifference (object, base) {
  	let changes = (object, base) => {
  		return transform(object, (result, value, key) => {
  			if (!isEqual(value, base[key])) {
  				result[key] = (isObject(value) && isObject(base[key])) ? changes(value, base[key]) : value;
  			}
  		});
  	}
  	return changes(object, base);
  }

  setNullValues (object) {
    let changes = (object) => {
  		return transform(object, (result, value, key) => {
        // Keep null and not undefined or it won't be considered by jsontocontent when back or forward
  			result[key] = (isObject(value)) ? changes(value) : null;
  		});
  	}
  	return changes(object);
  }
}
