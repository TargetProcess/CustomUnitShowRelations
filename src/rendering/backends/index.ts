import Application from 'src/application';
import { ViewMode } from 'src/board';
import BoardRenderingBackend from './board_rendering_backend';
import ListRenderingBackend from './list_rendering_backend';
import TimelineRenderingBackend from './timeline_rendering_backend';

export { default as RenderingBackend } from './rendering_backend';

export function getBackendByViewMode(viewMode: ViewMode, application: Application) {
    switch (viewMode) {
        case ViewMode.Board:
            return new BoardRenderingBackend(application);
        case ViewMode.Details:
            return new BoardRenderingBackend(application);
        case ViewMode.List:
            return new ListRenderingBackend(application);
        case ViewMode.Timeline:
            return new TimelineRenderingBackend(application);
    }
}
