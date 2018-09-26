import FeatureToggle from 'src/feature_toggles/feature_toggle';
import { loadResource } from 'src/utils/api';

type IFeatureTogglesList = Record<FeatureToggle, boolean>;

export default class FeatureToggles {
    private cache: IFeatureTogglesList | null = null;

    public async get(featureToggle: FeatureToggle) {
        if (!this.cache) {
            this.cache = await loadResource<IFeatureTogglesList>('featuretoggling');
        }

        return this.cache[featureToggle] || false;
    }
}
