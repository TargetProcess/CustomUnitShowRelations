import svgTemplate from 'assets/svg.html';
import * as $ from 'jquery';
import { relationsConfigs } from 'src/relations';
import * as relationUtils from 'src/utils/relation.lines';

export const createSvgFromTemplate = (width: number, height: number) => $(svgTemplate({
    relationsConfigs,
    width,
    height,
    getRelationTypeColor: relationUtils.getRelationTypeColor,
    getRelationTypeMarkerStartId: relationUtils.getRelationTypeMarkerStartId,
    getRelationTypeMarkerEndId: relationUtils.getRelationTypeMarkerEndId
}));
