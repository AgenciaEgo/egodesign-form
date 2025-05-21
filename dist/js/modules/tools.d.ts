export declare const vanillaFade: ({ element, enter, time, displayType, callback }: {
    element: HTMLElement;
    enter?: boolean;
    time?: number;
    displayType?: string;
    callback?: Function;
}) => void;
export declare const getParentByClassName: ({ element, className }: {
    element: HTMLElement | null;
    className: string;
}) => HTMLElement | null;
export declare const isInViewport: ({ element }: {
    element: HTMLElement;
}) => boolean;
export declare function showLog(msg: string, type?: 'log' | 'data'): void;
export declare function scrollIntoViewWithOffset(element: HTMLElement | null, offset: number): void;
