import * as $ from 'jquery';
import relationTypes from 'src/relationTypes';
import svgTemplate from 'src/templates/svg.html';
import * as relationUtils from 'src/utils/relation.lines';

export const createSvgFromTemplate = (width: number, height: number) => $(svgTemplate({
    relationTypes,
    width,
    height,
    getRelationTypeColor: relationUtils.getRelationTypeColor,
    getRelationTypeMarkerStartId: relationUtils.getRelationTypeMarkerStartId,
    getRelationTypeMarkerEndId: relationUtils.getRelationTypeMarkerEndId
}));
