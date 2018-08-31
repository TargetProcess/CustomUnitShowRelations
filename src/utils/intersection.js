const intersectSlices = ({x1: x11, x2: x12, y1: y11, y2: y12}, {x1: x21, x2: x22, y1: y21, y2: y22}) => {
    const y = (y11 * (y22 - y21) * (x12 - x11) -
        y21 * (y12 - y11) * (x22 - x21) +
        (x21 - x11) * (y22 - y21) * (y12 - y11)) /
        ((y22 - y21) * (x12 - x11) - (y12 - y11) * (x22 - x21));

    const x = (x11 * (x22 - x21) * (y12 - y11) -
        x21 * (x12 - x11) * (y22 - y21) +
        (y21 - y11) * (x22 - x21) * (x12 - x11)) /
        ((x22 - x21) * (y12 - y11) - (x12 - x11) * (y22 - y21));

    return {x, y};
};

const getSlicesByRect = (rect) => [{
        x1: rect.x,
        y1: rect.y,
        x2: rect.x + rect.width,
        y2: rect.y
    }, {
        x1: rect.x + rect.width,
        y1: rect.y,
        x2: rect.x + rect.width,
        y2: rect.y + rect.height
    }, {
        x1: rect.x,
        y1: rect.y + rect.height,
        x2: rect.x + rect.width,
        y2: rect.y + rect.height
    }, {
        x1: rect.x,
        y1: rect.y,
        x2: rect.x,
        y2: rect.y + rect.height
    }];

const isBetween = (coord, x, y) => coord >= Math.floor(x) && coord <= Math.ceil(y);

const checkInSlices = (point, s1, s2) => {
    const isX1 = isBetween(point.x, Math.min(s1.x1, s1.x2), Math.max(s1.x1, s1.x2));
    const isX2 = isBetween(point.x, Math.min(s2.x1, s2.x2), Math.max(s2.x1, s2.x2));
    const isY1 = isBetween(point.y, Math.min(s1.y1, s1.y2), Math.max(s1.y1, s1.y2));
    const isY2 = isBetween(point.y, Math.min(s2.y1, s2.y2), Math.max(s2.y1, s2.y2));

    return isX1 && isX2 && isY1 && isY2;
};

const intersectRect = (rect, targetSlice) => {
    const rectSlices = getSlicesByRect(rect);

    let intersectPoint = null;
    let lastPoint = null;

    rectSlices.forEach((slice) => {
        const point = intersectSlices(slice, targetSlice);

        lastPoint = point;
        if (checkInSlices(point, targetSlice, slice)) {
            intersectPoint = point;
        }
    });

    return intersectPoint || lastPoint;
};

export const intersectRects = (rect1, rect2) => {
    const sc = {
        x1: rect1.x + rect1.width / 2,
        y1: rect1.y + rect1.height / 2,
        x2: rect2.x + rect2.width / 2,
        y2: rect2.y + rect2.height / 2
    };

    return {
        start: intersectRect(rect1, sc),
        end: intersectRect(rect2, sc)
    };
};
