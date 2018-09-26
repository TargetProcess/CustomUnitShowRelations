import * as React from 'react';
import { IRelationConfig, relationsConfigs } from 'src/relations';
import * as styles from 'src/rendering/styles';

export interface ISvgProps {
    width: number;
    height: number;
}

export default class Svg extends React.PureComponent<ISvgProps> {
    public render() {
        const { width = 0, height = 0 } = this.props;

        return (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mashupCustomUnitShowRelations__svg"
                viewBox={`0 0 ${width} ${height}`}
                width={`${width}px`}
                height={`${height}px`}
            >
                <defs>
                    {this.renderRelationsConfigs()}
                </defs>
            </svg>
        );
    }

    private renderRelationsConfigs() {
        const result: JSX.Element[] = [];

        relationsConfigs.forEach((relationConfig) => {
            return [true, false].forEach((hasViolations) => {
                result.push(...this.renderMarkers(relationConfig, hasViolations));
            });
        });

        return result;
    }

    private renderMarkers(relationConfig: IRelationConfig, hasViolations: boolean) {
        return [this.renderStartMarker(relationConfig, hasViolations), this.renderEndMarker(relationConfig, hasViolations)];
    }

    private renderStartMarker(relationConfig: IRelationConfig, hasViolations: boolean) {
        return (
            <marker
                className="line-marker line-marker__start"
                viewBox="0 0 10 10"
                id={styles.getRelationTypeMarkerStartId(relationConfig.type, hasViolations)}
                key={`start-${relationConfig.type}-${hasViolations}`}
                markerWidth="17"
                markerHeight="17"
                refX="5"
                refY="5"
                markerUnits="userSpaceOnUse"
            >
                <circle
                    cx="5"
                    cy="5"
                    r="1.5"
                    style={{ stroke: styles.getRelationTypeColor(relationConfig, hasViolations), fill: '#fff' }}
                />
            </marker>
        );
    }

    private renderEndMarker(relationConfig: IRelationConfig, hasViolations: boolean) {
        return (
            <marker
                className="line-marker line-marker__end"
                viewBox="0 0 10 10"
                id={styles.getRelationTypeMarkerEndId(relationConfig.type, hasViolations)}
                key={`end-${relationConfig.type}-${hasViolations}`}
                markerWidth="20"
                markerHeight="20"
                orient="auto"
                refX="0"
                refY="2"
                markerUnits="userSpaceOnUse"
            >
                <path d="M0,0 L4,2 0,4" fill={styles.getRelationTypeColor(relationConfig, hasViolations)} />
            </marker>
        );
    }
}
