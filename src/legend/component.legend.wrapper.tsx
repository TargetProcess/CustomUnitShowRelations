import * as React from 'react';
import ComponentLegend from 'src/legend/component.legend';
import { IRelationConfig } from 'src/legend/legend.model';

export interface IOnSelectEventData {
    name: string;
    show: boolean;
}

interface IComponentLegendWrapperProps {
    onUpdateLegend: { add: (callback: (newProps: IComponentLegendWrapperState) => void, context: object) => void, remove: (context: object) => void };
}

interface IComponentLegendWrapperState {
    isVisible: boolean;
    isExpanded: boolean;
    relationConfigs: IRelationConfig[];
    onExpansionStateChange: (newState: boolean) => void;
    onRelationTypeSelect: (eventData: IOnSelectEventData) => void;
}

export default class ComponentLegendWrapper extends React.Component<IComponentLegendWrapperProps, IComponentLegendWrapperState> {
    constructor(props: IComponentLegendWrapperProps) {
        super(props);

        this.props.onUpdateLegend.add((newProps) => {
            this.setState(newProps);
        }, this);
    }

    public componentWillUnmount() {
        this.props.onUpdateLegend.remove(this);
    }

    public render() {
        return <ComponentLegend {...this.state} />;
    }
}
