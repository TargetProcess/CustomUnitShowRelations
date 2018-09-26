import classnames from 'libs/classNames';
import * as React from 'react';

interface IViolationsButtonProps {
    violationsCount: number;
    isActive: boolean;
    onClick: () => void;
}

function simplePluralize(word: string, count: number) {
    return count > 1 ? word + 's' : word;
}

export default class ViolationsButton extends React.PureComponent<IViolationsButtonProps> {
    public render() {
        const buttonClasses = classnames('tau-btn', 'tau-violations-btn',
            { 'tau-checked': this.props.isActive, 'i-role-board-tooltip': !this.props.isActive }
        );

        return (
            <button
                onClick={this.props.onClick}
                role="show-violations-button"
                className={buttonClasses}
                type="button"
                data-title="Focus on items that are out of order"
            >
                <span>{this.props.violationsCount} planning {simplePluralize('issue', this.props.violationsCount)}</span>
            </button>
        );
    }
}
