import React from 'react';
import * as intl from 'tau-intl';

const getRelationCssClass = (relation) => {
    return `relations-legend__item-name--type-${relation.name.toLowerCase()}`;
};

export default class LegendRelations extends React.Component {
    onSelect(change) {
        this.props.onSelect(change);
    }

    render() {
        return <ul className="relations-legend relations-legend--expanded">
            {this.props.relations.map((r => <li key={r.name} className="relations-legend__item">
                <label className="tau-checkbox relations-legend__checkbox">
                        <span
                            className={`tau-checkbox relations-legend__item-name tau-checkbox  ${getRelationCssClass(r)}`}>{r.label}</span>
                    <input onChange={this.onSelect.bind(this, {name: r.name, show: !r.show})} checked={r.show}
                           type="checkbox"
                           className="i-role-toggle-global-rules" value="on"/>
                    <i className="tau-checkbox__icon"></i>
                </label>
            </li>))}
        </ul>;
    }
}
