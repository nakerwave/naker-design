
import { TextInput, textoption } from './text';
import { inputEvents } from './input';

import axios from 'axios';
import Suggestions from 'suggestions';
import map from 'lodash/map';

/*
  +------------------------------------------------------------------------+
  | FONT INPUT                                                             |
  +------------------------------------------------------------------------+
*/

export interface FontInterface {
    text?: string;
    href?: string;
}

export class FontInput extends TextInput {
    
    fontsuggestion: any;

    constructor(parent: HTMLElement, label: string, textoption: textoption, className?: string) {
        super(parent, label, textoption, className);

        // setStyle(this.fontFamily, { width: '150px' });

        this.on('focus', () => {
            this.fontsuggestion.update(this.fontNames);
        });

        this.fontsuggestion = new Suggestions(this.el, [], {
            minLength: 0,
            limit: 20,
        });
        this.getGoogleFonts();
    }

    inputEvent: inputEvents = {
        change: 'change',
        input: 'input',
        focus: 'focus',
        blur: 'blur',
        click: 'click',
        enterkey: 'enterkey',
    };
    fontNames: Array<string> = [];
    getGoogleFonts() {
        axios.get('https://www.googleapis.com/webfonts/v1/webfonts?sort=popularity&key=AIzaSyDwXUFOSFMF44soDpKz2WbHKelntWtl9yU')
            .then((response) => {
                let res = response.data;
                let fontlist = res.items;
                this.fontNames = map(fontlist, 'family');
            })
            .catch((error) => {
                console.log(error);
            });
    }
}