import * as _ from 'underscore';

// Issue: $('...').addClass don't work for svg elements, elememt.classList.add(...) don't work in IE11
export function addClassToSvgElement(element: HTMLElement, className: string) {
    const existingClasses = (element.getAttribute('class') || '').split(' ');
    if (_.includes(existingClasses, className)) {
        return;
    }

    existingClasses.push(className);
    element.setAttribute('class', existingClasses.join(' '));
}

// Issue: $('...').removeClass don't work for svg elements, elememt.classList.remove(...) don't work in IE11
export function removeClassFromSvgElement(element: HTMLElement, className: string) {
    const existingClasses = (element.getAttribute('class') || '').split(' ');
    if (!_.includes(existingClasses, className)) {
        return;
    }

    const newClasses = existingClasses.filter((existingClassName) => existingClassName !== className);
    element.setAttribute('class', newClasses.join(' '));
}
