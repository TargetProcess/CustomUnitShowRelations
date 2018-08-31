import * as $ from 'jquery';

export const onHideEmptyLines = (next: () => void) => $(document).on('click', '.i-role-hide-empty-lanes', () => next());
