import * as React from 'react';
import { IRelationConfig, relationsConfigs, RelationType } from 'src/relations';

const getRelationCssClass = (relationConfig: IRelationConfig) => {
    return `relations-legend__item-name--type-${relationConfig.type.toLowerCase()}`;
};

interface ILegendRelationsProps {
    visibleRelationTypes: Set<RelationType>;
    onSelect: (relationType: RelationType) => void;
}

export default class LegendRelations extends React.Component<ILegendRelationsProps> {
    public render() {
        return (
            <ul className="relations-legend relations-legend--expanded">
                {relationsConfigs.map(((relationConfig) => this.renderRelation(relationConfig)))}
            </ul>
        );
    }

    public renderRelation(relationConfig: IRelationConfig) {
        const className = `tau-checkbox relations-legend__item-name tau-checkbox ${getRelationCssClass(relationConfig)}`;
        const isRelationTypeShown = this.props.visibleRelationTypes.has(relationConfig.type);

        return (
            <li key={relationConfig.type} className="relations-legend__item">
                <label className="tau-checkbox relations-legend__checkbox">
                    <span className={className}>{relationConfig.label}</span>
                    <input
                        onChange={() => this.props.onSelect(relationConfig.type)}
                        checked={isRelationTypeShown}
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
