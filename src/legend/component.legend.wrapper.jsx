import React from 'react';
import ComponentLegend from './component.legend.jsx';

export default class ComponentLegendWrapper extends React.Component {
    constructor(props) {
        super(props);
        this.state = props;
        this.props.onUpdateLegend.add((newProps) => {
            this.setState(newProps);
        }, this);
    }

    componentWillUnmount() {
        this.props.onUpdateLegend.remove(this);
    }

    render() {
        return <ComponentLegend {...this.state} />;
    }
}
