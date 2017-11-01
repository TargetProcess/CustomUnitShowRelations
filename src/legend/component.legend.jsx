import React from 'react';
import classnames from 'libs/classNames';
import labels from './component.legend.labels';
import LegendRelations from './component.legend.relations.jsx';

export default class ComponentLegend extends React.Component {
    onClick = () => {
        this.props.onExpansionStateChange(!this.props.isExpanded);
    };

    render() {
        const {isExpanded} = this.props;
        const buttonCssClass = classnames({
            'tau-btn': true,
            'i-role-show-relations': true,
            'i-role-board-tooltip': true,
            'tau-checked': isExpanded
        });

        const buttonTitle = isExpanded ? labels.BUTTON_TITLE_EXPANDED : labels.BUTTON_TITLE_COLLAPSED;
        const buttonText = isExpanded ? labels.BUTTON_TEXT_EXPANDED : labels.BUTTON_TEXT_COLLAPSED;

        if (!this.props.isVisible) {
            return null;
        }

        return <div
            className="board-actions__group board-actions__group--controls board-actions__group--visual-encoding i-role-board-actions-group">
            <div className="board-actions__item board-actions__item--two-column action-show-relations">
                <span className="board-actions__item__text">Relations</span>

                <div className="board-actions__item__control">
                    <button onClick={this.onClick} type="button"
                            className={buttonCssClass}
                            title={buttonTitle}>
                        <span className="tau-btn__text">{buttonText}</span>
                    </button>
                </div>
            </div>
            {this.props.isExpanded &&
            <LegendRelations relations={this.props.relations} onSelect={this.props.onRelationTypeSelect}/>}
        </div>;
    }
}
