import relationTypes from '../relationTypes';

export const getRelationTypeMarkerStartId = ({name}) => `${name}_start`;
export const getInboundRelationTypeMarkerEndId = ({name}) => `${name}_inbound_end`;
export const getOutboundRelationTypeMarkerEndId = ({name}) => `${name}_outbound_end`;
export const getRelationTypeColor = ({style}) => style.color;
export const getRelationColor = (relation) =>
    getRelationTypeColor(relationTypes.filter(({name}) => name === relation)[0]);
export const generateBezierCoords = (start, end, down = false) => {
    const points = [`M${start.x},${start.y}`];

    const rad = Math.PI / 48 * (down ? -1 : 1);

    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    const centerOnLine = {
        x: (start.x + end.x) / 2,
        y: (start.y + end.y) / 2
    };

    const centerRot = {
        x: (centerOnLine.x - start.x) * cos - (centerOnLine.y - start.y) * sin + start.x,
        y: (centerOnLine.x - start.x) * sin + (centerOnLine.y - start.y) * cos + start.y
    };

    const center = `${centerRot.x},${centerRot.y}`;

    return points.concat(`C${center}`).concat(center).concat(`${end.x},${end.y}`).join(' ');
};
