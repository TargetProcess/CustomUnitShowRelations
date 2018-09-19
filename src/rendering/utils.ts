import { IPoint } from 'src/utils/intersection';

export function generateBezierCoords(start: IPoint, end: IPoint) {
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

    return [`M${start.x},${start.y}`, `C${center}`, center, `${end.x},${end.y}`].join(' ');
}
