import * as React from 'react';
import { IOnSelectEventData } from 'src/legend/component.legend.wrapper';
import { IRelationType } from 'src/relationTypes';

const getRelationCssClass = (relation: IRelationType) => {
    return `relations-legend__item-name--type-${relation.name.toLowerCase()}`;
};

interface ILegendRelationsProps {
    relations: IRelationType[];
    onSelect: (eventData: IOnSelectEventData) => void;
}

export default class LegendRelations extends React.Component<ILegendRelationsProps> {
    public onSelect(eventData: IOnSelectEventData) {
        this.props.onSelect(eventData);
    }

    public render() {
        return (
            <ul className="relations-legend relations-legend--expanded">
                {this.props.relations.map(((relationType) => this.renderRelationType(relationType)))}
            </ul>
        );
    }

    public renderRelationType(relationType: IRelationType) {
        const className = `tau-checkbox relations-legend__item-name tau-checkbox ${getRelationCssClass(relationType)}}`;

        return (
            <li key={relationType.name} className="relations-legend__item">
                <label className="tau-checkbox relations-legend__checkbox">
                    <span className={className}>{relationType.label}</span>
                    <input
                        onChange={() => this.onSelect({ name: relationType.name, show: !relationType.show })}
                        checked={relationType.show}
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
