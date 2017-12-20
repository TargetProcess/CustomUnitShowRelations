import {addBusListener} from 'targetprocess-mashup-helper/lib/events';
import $ from 'jQuery';

export const onHideEmptyLines = (next) => $(document).on('click', '.i-role-hide-empty-lanes', () => next());
