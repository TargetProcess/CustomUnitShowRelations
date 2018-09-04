import * as React from 'react';
import { IOnSelectEventData } from 'src/legend/component.legend.wrapper';
import { IRelationConfig } from 'src/legend/legend.model';

const getRelationCssClass = (relationConfig: IRelationConfig) => {
    return `relations-legend__item-name--type-${relationConfig.name.toLowerCase()}`;
};

interface ILegendRelationsProps {
    relationConfigs: IRelationConfig[];
    onSelect: (eventData: IOnSelectEventData) => void;
}

export default class LegendRelations extends React.Component<ILegendRelationsProps> {
    public onSelect(eventData: IOnSelectEventData) {
        this.props.onSelect(eventData);
    }

    public render() {
        return (
            <ul className="relations-legend relations-legend--expanded">
                {this.props.relationConfigs.map(((relationConfig) => this.renderRelation(relationConfig)))}
            </ul>
        );
    }

    public renderRelation(relationConfig: IRelationConfig) {
        const className = `tau-checkbox relations-legend__item-name tau-checkbox ${getRelationCssClass(relationConfig)}}`;

        return (
            <li key={relationConfig.name} className="relations-legend__item">
                <label className="tau-checkbox relations-legend__checkbox">
                    <span className={className}>{relationConfig.label}</span>
                    <input
                        onChange={() => this.onSelect({ name: relationConfig.name, show: !relationConfig.show })}
                        checked={relationConfig.show}
                        type="checkbox"
                        className="i-role-toggle-global-rules"
                        value="on"
                    />
                    <i className="tau-checkbox__icon" />
                </label>
            </li>
        );
    }
}
