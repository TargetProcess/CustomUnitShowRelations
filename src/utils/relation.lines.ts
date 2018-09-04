import relationTypes from 'src/relationTypes';
import { IPoint } from 'src/utils/intersection';

export const getRelationTypeMarkerStartId = ({ name }: any, hasViolations: boolean) => `${name}${hasViolations ? '_violated' : ''}_start`;
export const getRelationTypeMarkerEndId = ({ name }: any, hasViolations: boolean) => `${name}${hasViolations ? '_violated' : ''}_outbound_end`;
export const getRelationTypeColor = ({ style }: any, hasViolations: boolean) => hasViolations ? style.violatedColor : style.color;
export const getRelationColor = (relationType: string, hasViolations: boolean) =>
    getRelationTypeColor(relationTypes.find(({ name }) => name === relationType), hasViolations);
export const generateBezierCoords = (start: IPoint, end: IPoint) => {
    const points = [`M${start.x},${start.y}`];

    const rad = Math.PI / 48;

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
