
import { el, mount, setChildren, setAttr } from 'redom';
import Sortable from 'sortablejs';
import find from 'lodash/find';

/*
  +------------------------------------------------------------------------+
  | SORTABLE GROUP                                                         |
  +------------------------------------------------------------------------+
*/

export interface sortableObject {
    name: string;
    type: string;
    el?: HTMLElement;
}

export class SortableGroup {

    container: HTMLElement;
    sortableContainer: HTMLElement;
    iconsContainer: HTMLElement;

    constructor() {
        this.container = el('div.preset-group',
            [
                el('div.parameter-title.sortable-title',
                    el('div.title-text', 'sortable Panel')
                ),
                this.iconsContainer = el('div.sortable-main-icon-container'),
                this.sortableContainer = el('div.list-group.editor-scroll.sortable-panel')
            ]
        );
        mount(layerLeft, this.container);
    }

    iconElements: Array<HTMLElement> = [];
    iconList: Array<string> = [];
    addIcon (icon:string, callback:Function):HTMLElement {
        let newIcon = el('div.right-icon.sortable-main-icon.icon-'+icon,
            { onclick: () => { callback() } },
            [el('span.path1'), el('span.path2'), el('span.path3')]
        );
        this.iconElements.push(newIcon);
        this.iconList.push(icon);
        mount(this.iconsContainer, newIcon);
        return newIcon;
    }

    sortableObjects: Array<sortableObject> = [];
    updateSortable(sortables: Array<sortableObject>) {
        this.deleteSortable();
        for (let i = 0; i < sortables.length; i++) {
            this.addSortable(sortables[i]);
        }
        this.setSortable(this.sortableContainer);
    }

    addSortable(sortable: sortableObject) {
        console.log(sortable);
        
        let sortableEl = el('div.sortable-button.panel.draggable.icon-' +sortable.type, {
            onclick: (evt) => { this.onClick(sortable.name, evt)},
            onmouseenter: (evt) => { this.onEnter(sortable.name, evt) },
            onmouseleave: (evt) => { this.onLeave(sortable.name, evt) },
            id: sortable.name,
        }, [
                el('span.path1'), el('span.path2'), el('span.path3'),
                el('div.sortable-tag', sortable.name)
        ]);
        sortable.el = sortableEl;
        mount(this.sortableContainer, sortableEl);
    }

    sortableList: any;
    setSortable(el: any) {
        this.sortableList = Sortable.create(el, {
            animation: 150,
            scroll: true,
            // delay: 100, // FIXME delay not working to avoir shadow showing on click
            group: "panel",
            draggable: '.draggable',
            ghostClass: "sortable-ghost", // Class name for the drop placeholder
            chosenClass: "sortable-chosen", // Class name for the chosen item
            dragClass: "sortable-drag", // Class name for the dragging item
            onEnd: (evt) => {
                // let id = evt.item.id;
                // let sortableManager = sortablesManager[id];
                this.setAllSortableIndex();
            },
        });
    }

    deleteSortable() {
        if (this.sortableList) this.sortableList.destroy();
        setChildren(this.sortableContainer, []);
    }
    
    setAllSortableIndex() {
        let el = this.sortableList.el;
        let newSortable = [];
        for (let j = 0; j < el.childNodes.length; j++) {
            let name = el.childNodes[j].textContent;
            let sortable: sortableObject = find(this.sortableObjects, (o) => { return name === o.name; });
            if (sortable) newSortable.push(sortable);
        }
        this.sortableObjects = newSortable;
        this.onSort();
    }

    select (name:string) {
        let sortable: sortableObject = find(this.sortableObjects, (o) => { return name === o.name; });
        setAttr(sortable.el, {selected : true});
    }

    unselect() {
        for (let i = 0; i < this.sortableObjects.length; i++) {
            const sortable: sortableObject = this.sortableObjects[i];
            setAttr(sortable.el, { selected: false });
        }
    }

    sortListeners: Array<Function> = [];
    clickListeners: Array<Function> = [];
    enterListeners: Array<Function> = [];
    leaveListeners: Array<Function> = [];
    on (event:'sort'|'click'|'enter'|'leave', callback:Function) {
        if (event == 'sort') this.sortListeners.push(callback);
        if (event == 'click') this.clickListeners.push(callback);
        if (event == 'enter') this.enterListeners.push(callback);
        if (event == 'leave') this.leaveListeners.push(callback);
    }

    onSort() {
        for (let i = 0; i < this.sortListeners.length; i++) {
            this.sortListeners[i](this.sortableObjects);
        }
    }

    onClick (name:string, evt:Event) {
        this.select(name);
        for (let i = 0; i  < this.clickListeners.length; i++) {
            this.clickListeners[i](name, evt);
        }
    }

    onEnter(name: string, evt: Event) {
        for (let i = 0; i < this.enterListeners.length; i++) {
            this.enterListeners[i](name, evt);
        }
    }

    onLeave(name: string, evt: Event) {
        for (let i = 0; i < this.leaveListeners.length; i++) {
            this.leaveListeners[i](name, evt);
        }
    }

}

/*
  +------------------------------------------------------------------------+
  | PARENT SORTABLE MANAGER                                                |
  +------------------------------------------------------------------------+
*/
export let layerLeft = el('div.layer-left.presets-container.editor-scroll');