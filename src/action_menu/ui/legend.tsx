import classnames from 'classnames';
import * as React from 'react';
import LegendRelations from 'src/action_menu/ui/legend_relations';
import { RelationType } from 'src/relations';
import * as intl from 'tau-intl';

const LABEL_TEXT = intl.formatMessage('Relations');
const BUTTON_TITLE_EXPANDED = intl.formatMessage('Click to hide relations');
const BUTTON_TITLE_COLLAPSED = intl.formatMessage('Click to show relations');
const BUTTON_TEXT_EXPANDED = intl.formatMessage('Hide');
const BUTTON_TEXT_COLLAPSED = intl.formatMessage('Show');

interface ILegendProps {
    isExpanded: boolean;
    isVisible: boolean;
    visibleRelationTypes: Set<RelationType>;
    onExpansionStateChange: (newState: boolean) => void;
    toggleRelationTypeVisibility: (relationType: RelationType) => void;
}

export default class Legend extends React.Component<ILegendProps> {
    public onClick = () => {
        this.props.onExpansionStateChange(!this.props.isExpanded);
    }

    public render() {
        const { isExpanded, isVisible } = this.props;

        if (!isVisible) {
            return null;
        }

        const buttonClasses = classnames({
            'tau-btn': true,
            'i-role-show-relations': true,
            'i-role-board-tooltip': true,
            'tau-checked': isExpanded
        });

        const labelClasses = classnames({
            'board-actions__item__text': true
        });

        const buttonTitle = isExpanded ? BUTTON_TITLE_EXPANDED : BUTTON_TITLE_COLLAPSED;
        const buttonText = isExpanded ? BUTTON_TEXT_EXPANDED : BUTTON_TEXT_COLLAPSED;

        return (
            <div className="board-actions__group board-actions__group--controls board-actions__group--visual-encoding i-role-board-actions-group">
                <div className="board-actions__item board-actions__item--two-column action-show-relations">
                    <span className={labelClasses}>{LABEL_TEXT}</span>

                    <div className="board-actions__item__control">
                        <button
                            // We need to completely re-render button as workaround for the issue with tooltip cache
                            key={`btn-is-expanded-${isExpanded}`}
                            onClick={this.onClick}
                            type="button"
                            className={buttonClasses}
                            data-title={buttonTitle}
                        >
                            <span className="tau-btn__text">{buttonText}</span>
                        </button>
                    </div>
                </div>
                {this.props.isExpanded && <LegendRelations visibleRelationTypes={this.props.visibleRelationTypes} onSelect={this.props.toggleRelationTypeVisibility}/>}
            </div>
        );
    }
}
