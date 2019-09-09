
import { ColorButton, colorpicker } from './Pickers/colorPicker';
import { AssetButton, ImageAssetButton, TextAssetbutton } from './Pickers/assetPicker';
import { UI _button } from './Inputs/button';
import { TextInputinput, ParagraphInputinput } from './Inputs/text';
import { NumberInputinput, VectorInputinput } from './Inputs/number';
import { RadioInput, RadioIconInput } from './Inputs/radio';
import { SelectInput } from './Inputs/select';
import { Checkbox } from './Inputs/checkbox';
import { SliderInput } from './Inputs/slider';
import { InputGroupSwitch } from './Layers/layer';
// import { undoChannel } from './service/undo';

// import './styles/custom-siimple.sass';
import './styles/main.sass';
import './styles/font.css';
import './styles/inputs.sass';
import './styles/suggestions.sass';
import './styles/modal.sass';
import './styles/uislider.sass';
import './styles/checkbox.sass';
import './styles/radio.sass';

/*
  +------------------------------------------------------------------------+
  | TEST DESIGN                                                            |
  +------------------------------------------------------------------------+
*/

export class TestDesign extends InputGroupSwitch {

    backgroundBottom: HTMLElement;
    backgroundTop: HTMLElement;
    colorPalette: HTMLElement;

    constructor() {
        super('Design Test', true);

        colorpicker.set();
        this.addInputs();
    }

    color: AssetButton;
    asset: AssetButton;
    asset2: ImageAssetButton;
    asset3: TextAssetbutton;
    number: NumberInputinput;
    numberunit: NumberInputinput;
    slider: SliderInput;
    sliderloga: SliderInput;
    vector: VectorInputinput;
    radio: RadioInput;
    radioicon: RadioIconInput;
    select: SelectInput;
    checkbox: Checkbox;
    text: TextInputinput;
    paragraph: ParagraphInputinput;

    addInputs() {
        this.addSubTitle('Color Pickers');
        this.color = this.addColorInput('Color', { opacity: false, removable: false }, (rgba) => {
        });
        this.color = this.addColorInput('Removable Color', { opacity: false, removable: true }, (rgba) => {
        });
        this.color = this.addColorInput('Alpha Color', { opacity: true, removable: false }, (rgba) => {
        });

        this.addSubTitle('Asset Pickers');
        this.asset = this.addAssetInput('Asset', { type: 'particle', url: 'https://d2uret4ukwmuoe.cloudfront.net/particle_v2/smoke_01.png' }, (rgba) => {
        });
        this.asset2 = this.addImageAssetInput('Image Asset', { type: 'particle', url: 'https://d2uret4ukwmuoe.cloudfront.net/particle_v2/smoke_01.png' }, (rgba) => {
        });
        this.asset3 = this.addTextAssetInput('Text Asset', { type: 'particle', url: 'https://d2uret4ukwmuoe.cloudfront.net/particle_v2/smoke_01.png' }, (rgba) => {
        });

        this.addSubTitle('Number');
        this.number = this.addNumberInput('Number', { step: 0.1, value: 0, min: 0, max: 10, unit: '' }, (value) => {
        });
        this.numberunit = this.addNumberInput('Number with unit', { step: 0.1, value: 0, min: 0, max: 10, unit: 'PX' }, (value) => {
        });
        this.slider = this.addSlider('Slider', { step: 0.1, value: 0, min: 0, max: 10 }, (value) => {
        });
        this.sliderloga = this.addSlider('Slider Logarithmique', { step: 0.1, value: 0, min: 0, max: 10, curve: 'logarithmic' }, (value) => {
        });
        this.vector = this.addVectorInput('Vector', { step: 0.1, value: 0, min: 0, max: 10 }, (value) => {
        });

        this.addSubTitle('Radio/Select');
        let eventlist = ['show', 'hover', 'enter', 'click', 'scroll', 'move'];
        this.radio = this.addRadio('Radio', { value: 'show', list: eventlist }, (value) => {
        });
        this.radioicon = this.addRadioIcon('Radio icon', { value: 'show', iconperline: 3, list: eventlist }, (value) => {
        });
        this.select = this.addSelect('Select', { value: 'show', list: eventlist }, (value) => {
        });
        this.checkbox = this.addCheckBox('Checkbox', true, (value) => {
        });

        this.addSubTitle('Text');
        this.text = this.addTextInput('Text', 'YOLO', (rgba) => {
        });
        this.paragraph = this.addParagraphInput('Paragrah', 'YOLO', (rgba) => {
        });
    }
}

window.onload = () => {
    let test = new TestDesign();
}
