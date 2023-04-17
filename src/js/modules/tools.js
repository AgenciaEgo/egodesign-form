export const docReady = fn => {
    if (document.readyState != 'loading' && typeof fn === 'function'){
        fn();
    } else {
        document.addEventListener('DOMContentLoaded', fn);
    }
}

export const vanillaFade = ({
    element, 
    enter, 
    time, 
    displayType, 
    callback
}) => {
    element.style.opacity = enter ? 0 : 1;
    if (enter) element.style.display = displayType || 'block';

    let last = +new Date();
    (function fade() {
        if (enter) element.style.opacity = +element.style.opacity + (new Date() - last) / (time || 200);
        else element.style.opacity = +element.style.opacity - (new Date() - last) / (time || 200);
        last = +new Date();
    
        if ((enter && +element.style.opacity < 1) || (!enter && +element.style.opacity > 0)) {
            (window.requestAnimationFrame && requestAnimationFrame(fade)) || setTimeout(fade, 16);
        }
        else {
            if (!enter) element.style.display = 'none';
            if (callback && typeof callback === 'function') callback();
        }
    })();
}

const findAnimationElement = () => {
    const bodyCurrent = document.body.scrollTop,
        docElCurrent = document.documentElement.scrollTop;
    document.documentElement.scrollTop = document.body.scrollTop = 10;
    let animate;
    if (document.body.scrollTop > 0) {
        animate = document.body;
        document.body.scrollTop = bodyCurrent;
    } else {
        animate = document.documentElement;
        document.documentElement.scrollTop = docElCurrent;
    }
    return animate;
};

export const vanillaScrollTo = ({ target, duration, offset }) => {
    if (!target) return false;

    const finishAt = Date.now() + duration,
        animate = findAnimationElement();
    requestAnimationFrame(tick);

    function tick() {
        const framesLeft = (finishAt - Date.now()) / 16.6;
        let distance = target ? target.getBoundingClientRect().top : 0;
        if (offset) distance = distance + offset;
        if (distance == 0) return;
        const direction = Math.sign(distance);
        
        if (framesLeft < 2 && framesLeft > -2) {
            // Last call
            animate.scrollTop += distance;
        } else {
            if (direction == -1) animate.scrollTop -= Math.max(1, distance / framesLeft);
            else animate.scrollTop += Math.max(1, distance / framesLeft);
            requestAnimationFrame(tick);
        }
    }
}

export const getParentByClassName = ({ element, className }) => {
    if (!element) return false;
    while (element && !element.classList.contains(className)) {
        element = element.parentElement ? element.parentElement : false;
    }
    return element;
}

export const getWindowTop = () => {
    return window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
}

export const getWindowBottom = () => {
    const top = getWindowTop();
    return window.innerHeight + top;
}

export const isElementVisible = element => {
    return window.getComputedStyle(element).display !== "none";
}

export const isInViewport = (element) => {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}