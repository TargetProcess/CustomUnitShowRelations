import $ from 'jQuery';
import * as relationUtils from '../utils/relation.lines';
import svgTemplate from '../templates/svg.html';
import relationTypes from '../relationTypes';

export const createSvgFromTemplate = (width, height) => $(svgTemplate({
        relationTypes,
        width,
        height,
        getRelationTypeColor: relationUtils.getRelationTypeColor,
        getRelationTypeMarkerStartId: relationUtils.getRelationTypeMarkerStartId,
        getInboundRelationTypeMarkerEndId: relationUtils.getInboundRelationTypeMarkerEndId,
        getOutboundRelationTypeMarkerEndId: relationUtils.getOutboundRelationTypeMarkerEndId
    }));
