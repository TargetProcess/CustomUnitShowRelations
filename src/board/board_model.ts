import ViewMode from 'src/board/view_mode';

export interface IGenericBoardModel {
    boardSettings: IBoardSettings;
}

export interface IBoardModel extends IGenericBoardModel {
    axes: {
        x: IBoardAxe[];
        y: IBoardAxe[];
    };
}

export interface IBoardAxe {
    id: string;
    entity: {
        id: number;
        type: string;
    };
}

export interface IBoardSettings {
    settings: {
        id: number;
        viewMode: ViewMode;
        hideEmptyLanes: boolean;
        page?: { x: number, y: number }
    };
}
