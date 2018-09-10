import classnames from 'libs/classNames';
import * as React from 'react';

interface IViolationsButtonProps {
    violationsCount: number;
    isActive: boolean;
    onClick: () => void;
}

export default class ViolationsButton extends React.PureComponent<IViolationsButtonProps> {
    public render() {
        const buttonClasses = classnames('tau-btn', 'tau-violations-btn', { 'tau-violations-btn__active': this.props.isActive });

        return (
            <button
                onClick={this.props.onClick}
                role="show-violations-button"
                className={buttonClasses}
                type="button"
            >
                <span className="tau-icon-general tau-icon-warning" />
                <span>{this.props.violationsCount} inappropriate planned dates</span>
            </button>
        );
    }
}
