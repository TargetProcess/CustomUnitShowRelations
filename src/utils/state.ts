import { IApplicationState } from 'src/application';
import * as _ from 'underscore';

export function isBoardConfigChanged(changes: Readonly<Partial<IApplicationState>>) {
    return !!changes.boardId || !!changes.viewMode;
}
