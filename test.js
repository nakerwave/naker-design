var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { colorpicker } from './Pickers/colorPicker';
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
var TestDesign = /** @class */ (function (_super) {
    __extends(TestDesign, _super);
    function TestDesign() {
        var _this = _super.call(this, 'Design Test', true) || this;
        colorpicker.set();
        _this.addInputs();
        return _this;
    }
    TestDesign.prototype.addInputs = function () {
        this.addSubTitle('Color Pickers');
        this.color = this.addColorInput('Color', { opacity: false, removable: false }, function (rgba) {
        });
        this.color = this.addColorInput('Removable Color', { opacity: false, removable: true }, function (rgba) {
        });
        this.color = this.addColorInput('Alpha Color', { opacity: true, removable: false }, function (rgba) {
        });
        this.addSubTitle('Asset Pickers');
        this.asset = this.addAssetInput('Asset', { type: 'particle', url: 'https://d2uret4ukwmuoe.cloudfront.net/particle_v2/smoke_01.png' }, function (rgba) {
        });
        this.asset2 = this.addImageAssetInput('Image Asset', { type: 'particle', url: 'https://d2uret4ukwmuoe.cloudfront.net/particle_v2/smoke_01.png' }, function (rgba) {
        });
        this.asset3 = this.addTextAssetInput('Text Asset', { type: 'particle', url: 'https://d2uret4ukwmuoe.cloudfront.net/particle_v2/smoke_01.png' }, function (rgba) {
        });
        this.addSubTitle('Number');
        this.number = this.addNumberInput('Number', { step: 0.1, value: 0, min: 0, max: 10, unit: '' }, function (value) {
        });
        this.numberunit = this.addNumberInput('Number with unit', { step: 0.1, value: 0, min: 0, max: 10, unit: 'PX' }, function (value) {
        });
        this.slider = this.addSlider('Slider', { step: 0.1, value: 0, min: 0, max: 10 }, function (value) {
        });
        this.sliderloga = this.addSlider('Slider Logarithmique', { step: 0.1, value: 0, min: 0, max: 10, curve: 'logarithmic' }, function (value) {
        });
        this.vector = this.addVectorInput('Vector', { step: 0.1, value: 0, min: 0, max: 10 }, function (value) {
        });
        this.addSubTitle('Radio/Select');
        var eventlist = ['show', 'hover', 'enter', 'click', 'scroll', 'move'];
        this.radio = this.addRadio('Radio', { value: 'show', list: eventlist }, function (value) {
        });
        this.radioicon = this.addRadioIcon('Radio icon', { value: 'show', iconperline: 3, list: eventlist }, function (value) {
        });
        this.select = this.addSelect('Select', { value: 'show', list: eventlist }, function (value) {
        });
        this.checkbox = this.addCheckBox('Checkbox', true, function (value) {
        });
        this.addSubTitle('Text');
        this.text = this.addTextInput('Text', 'YOLO', function (rgba) {
        });
        this.paragraph = this.addParagraphInput('Paragrah', 'YOLO', function (rgba) {
        });
    };
    return TestDesign;
}(InputGroupSwitch));
export { TestDesign };
window.onload = function () {
    var test = new TestDesign();
};
//# sourceMappingURL=test.js.map