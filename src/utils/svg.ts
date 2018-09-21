import svgTemplate from 'assets/svg.template';
import * as $ from 'jquery';
import { relationsConfigs } from 'src/relations';
import * as styles from 'src/utils/styles';

export const createSvgFromTemplate = (width: number, height: number) => $(svgTemplate({
    relationsConfigs,
    width,
    height,
    getRelationTypeColor: styles.getRelationTypeColor,
    getRelationTypeMarkerStartId: styles.getRelationTypeMarkerStartId,
    getRelationTypeMarkerEndId: styles.getRelationTypeMarkerEndId
}));
