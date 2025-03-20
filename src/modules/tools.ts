export const vanillaFade = ({
    element,
    enter,
    time,
    displayType,
    callback
}: {
    element: HTMLElement,
    enter?: boolean,
    time?: number,
    displayType?: string,
    callback?: Function
}) => {
    element.style.opacity = enter ? '0' : '1';
    if (enter) element.style.display = displayType || 'block';

    let last: number = new Date().getTime();
    (function fade() {
        if (enter) element.style.opacity = (+element.style.opacity + (new Date().getTime() - last) / (time || 200)).toString();
        else element.style.opacity = (+element.style.opacity - (new Date().getTime() - last) / (time || 200)).toString();
        last = new Date().getTime();

        if ((enter && Number(element.style.opacity) < 1) || (!enter && Number(element.style.opacity) > 0)) {
            requestAnimationFrame(fade) || setTimeout(fade, 16);
        }
        else {
            if (!enter) element.style.display = 'none';
            if (callback && typeof callback === 'function') callback();
        }
    })();
}

const findAnimationElement = (): HTMLElement => {
    const bodyCurrent: number = document.body.scrollTop,
        docElCurrent: number = document.documentElement.scrollTop;
    document.documentElement.scrollTop = document.body.scrollTop = 10;
    let animate: HTMLElement;
    if (document.body.scrollTop > 0) {
        animate = document.body;
        document.body.scrollTop = bodyCurrent;
    } else {
        animate = document.documentElement;
        document.documentElement.scrollTop = docElCurrent;
    }
    return animate;
};

export const getParentByClassName = ({
    element, className
}: {
    element: HTMLElement | null, className: string
}): HTMLElement | null => {
    if (!element) return null;
    while (element && !element.classList.contains(className)) {
        element = element.parentElement ? element.parentElement : null;
    }
    return element;
}

export const isInViewport = ({ element }: { element: HTMLElement }): boolean => {
    const rect: DOMRect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

export function showLog(msg: string, type: 'log' | 'data' = 'log') {
    if (type == 'log') {
        console.log('::EgoForm:: ' + msg);
    }
    else if (type == 'data') {
        console.log('::EgoForm:: DATA');
        console.table(msg);
    }
}

export function scrollIntoViewWithOffset(element: HTMLElement | null, offset: number): void {
    if (!element) return;
    window.scrollTo({
        behavior: 'smooth',
        top:
            element.getBoundingClientRect().top -
            document.body.getBoundingClientRect().top -
            offset,
    })
}