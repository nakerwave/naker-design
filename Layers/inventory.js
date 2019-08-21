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
import { threedJsonHelper } from '../../viewer/service/threedjsonhelper';
import { projectInterface } from '../../viewer/service/projectInterface';
import { el, setAttr, mount, unmount } from 'redom';
import cloneDeep from 'lodash/cloneDeep';
/*
  +------------------------------------------------------------------------+
  | INVENTORY MANAGER                                                      |
  +------------------------------------------------------------------------+
*/
var inventoryClass = /** @class */ (function (_super) {
    __extends(inventoryClass, _super);
    function inventoryClass(assetType, parent) {
        var _this = _super.call(this, parent.el, 'inventory') || this;
        _this.namelist = [];
        _this.buttonList = {};
        _this.assetList = [];
        _this.assetType = assetType;
        _this.setSaveInputs(_this.assetType);
        return _this;
    }
    inventoryClass.prototype.setSaveInputs = function (placeholder) {
        var _this = this;
        this.addTitle(placeholder + 's Inventory');
        this.placeholder = placeholder;
        this.nameinput = this.addInput(placeholder + ' name', 'inventory-input');
        this.nameinput.on('input', function (text) {
            _this.currentname = text;
        });
        this.nameinput.on('enterkey', function (text) {
            _this.addNewValueFromInput(placeholder);
        });
        var button = this.addButton({ ui: 'text', text: 'Save' }, 'inventory-add-button');
        button.on('click', function () {
            _this.addNewValueFromInput(placeholder);
        });
        this.inventoryContainer = this.addContainer('inventory-container-list editor-scroll');
    };
    inventoryClass.prototype.addNewValueFromInput = function (name) {
        if (this.currentname == '' || this.currentname == undefined)
            this.currentname = name + ' ' + (this.namelist.length + 1).toString();
        var index = this.namelist.indexOf(this.currentname);
        if (index != -1)
            return;
        if (this.onAdd != undefined)
            this.onAdd(this.currentname);
        this.setInputValue();
    };
    inventoryClass.prototype.addNewValue = function (name, asset) {
        this.addButtonInInventory(name);
        this.addValueInInventory(name, asset);
    };
    inventoryClass.prototype.addValueInInventory = function (name, asset) {
        var assetToSave = threedJsonHelper.recursiveObjectToObject(projectInterface[this.assetType], asset);
        assetToSave.name = name;
        this.assetList.push(assetToSave);
    };
    inventoryClass.prototype.setInputValue = function () {
        this.nameinput.setValue('');
        setAttr(this.nameinput.el, { placeholder: this.placeholder + ' ' + (this.namelist.length + 1).toString() });
        this.currentname = '';
    };
    inventoryClass.prototype.addButtonInInventory = function (name) {
        var _this = this;
        this.namelist.push(name);
        var button = el('div.inventory-button-list', name, { onclick: function () { if (_this.onClick != undefined)
                _this.manageClick(name); } }, el('div.inventory-button-delete.right-icon.icon-delete', { onclick: function (evt) { evt.stopPropagation(); _this.removeValue(button, name); } }, [el('span.path1'), el('span.path2'), el('span.path3')]));
        mount(this.inventoryContainer.el, button);
        this.buttonList[name] = button;
    };
    inventoryClass.prototype.removeValue = function (button, name) {
        var index = this.namelist.indexOf(name);
        if (index != -1)
            this.namelist.splice(index, 1);
        delete this.buttonList[name];
        this.setInputValue();
        unmount(this.inventoryContainer.el, button);
        for (var i = 0; i < this.assetList.length; i++) {
            if (this.assetList[i].name == name)
                delete this.assetList[i];
        }
    };
    inventoryClass.prototype.getAssetFromName = function (name) {
        for (var i = 0; i < this.assetList.length; i++) {
            if (this.assetList[i].name == name)
                return this.assetList[i];
        }
        return null;
    };
    inventoryClass.prototype.manageClick = function (name) {
        var savedAnimation = this.getAssetFromName(name);
        if (savedAnimation == null)
            return;
        // Keep loop and don't replace currentAnimation entirely or content animation will be replace and it won't save changes
        // CloneDeep important or contents will share the saved parameters
        var newAsset = {};
        for (var key in savedAnimation) {
            newAsset[key] = cloneDeep(savedAnimation[key]);
        }
        this.onClick(newAsset);
    };
    return inventoryClass;
}(ui_container));
export { inventoryClass };
//# sourceMappingURL=inventory.js.map