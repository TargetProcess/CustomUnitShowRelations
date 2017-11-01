import {addBusListener} from 'targetprocess-mashup-helper/lib/events';
import $ from 'jQuery';

export const onZoomLevelChanged = (next) => {
    addBusListener('board_plus', 'model.zoomLevelChanged', () => next());
};

export const onHideEmptyLines = (next) => $(document).on('click', '.i-role-hide-empty-lanes', () => next());

export const onExpandCollapseAxis =
    (next) => addBusListener('board_plus', 'view.axis.collapser.executed.after', () => next());

