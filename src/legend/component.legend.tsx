import classnames from 'libs/classNames';
import * as React from 'react';
import labels from 'src/legend/component.legend.labels';
import LegendRelations from 'src/legend/component.legend.relations';
import { IOnSelectEventData } from 'src/legend/component.legend.wrapper';
import { IRelationConfig } from 'src/legend/legend.model';

interface IComponentLegendProps {
    isExpanded: boolean;
    isVisible: boolean;
    relationConfigs: IRelationConfig[];
    onExpansionStateChange: (newState: boolean) => void;
    onRelationTypeSelect: (eventData: IOnSelectEventData) => void;
}

export default class ComponentLegend extends React.Component<IComponentLegendProps> {
    public onClick = () => {
        this.props.onExpansionStateChange(!this.props.isExpanded);
    }

    public render() {
        const { isExpanded } = this.props;

        const classConfig = {
            'tau-btn': true,
            'i-role-show-relations': true,
            'i-role-board-tooltip': true,
            'tau-checked': isExpanded
        };

        const labelClassConfig = {
            'board-actions__item__text': true
        };

        const buttonCssClass = classnames(classConfig);
        const labelCssClass = classnames(labelClassConfig);

        const buttonTitle = isExpanded ? labels.BUTTON_TITLE_EXPANDED : labels.BUTTON_TITLE_COLLAPSED;
        const buttonText = isExpanded ? labels.BUTTON_TEXT_EXPANDED : labels.BUTTON_TEXT_COLLAPSED;

        if (!this.props.isVisible) {
            return null;
        }

        return (
            <div className="board-actions__group board-actions__group--controls board-actions__group--visual-encoding i-role-board-actions-group">
                <div className="board-actions__item board-actions__item--two-column action-show-relations">
                    <span className={labelCssClass}>Relations</span>

                    <div className="board-actions__item__control">
                        <button
                            onClick={this.onClick}
                            type="button"
                            className={buttonCssClass}
                            title={buttonTitle}
                        >
                            <span className="tau-btn__text">{buttonText}</span>
                        </button>
                    </div>
                </div>
                {this.props.isExpanded && <LegendRelations relationConfigs={this.props.relationConfigs} onSelect={this.props.onRelationTypeSelect}/>}
            </div>
        );
    }
}
