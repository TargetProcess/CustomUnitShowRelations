import $ from 'jQuery';

export const onHideEmptyLines = (next) => $(document).on('click', '.i-role-hide-empty-lanes', () => next());
