export interface elementEvents {
    change?: string;
    focus?: string;
    blur?: string;
    input?: string;
    click?: string;
    enterkey?: string;
    down?: string;
    up?: string;
    enter?: string;
    leave?: string;
    move?: string;
    dblclick?: string;
}
export declare class ui {
    el: HTMLElement;
    renameEvent: elementEvents;
    on(event: string, funct: Function): this;
    destroy(): this;
    hide(): this;
    show(): this;
}
