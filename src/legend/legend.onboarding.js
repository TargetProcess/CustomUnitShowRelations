import $ from 'jQuery';

const REST_STORAGE_GROUP_NAME = 'showRelationsMetadata';
const FIELD_NAME = 'userData';
const NEW_CSS_LABEL_CLASS = 'new-feature-label';
const actionsButtonSelector = '.tau-app-main-pane';

const defaultMetadata = {
    isRelationsFeatureUsed: false
};

class LegendOnboarding {
    constructor() {
        this.shouldShowLabelOnActions = false;
        this.shouldShowLabelOnControl = false;
        this._userKey = `user${(window.loggedUser || {id: null}).id}`;
    }

    setRestStorage(restStorage) {
        this.restStorage = restStorage;
    }

    loadOnboardingSettings() {
        return this.restStorage
            .select(REST_STORAGE_GROUP_NAME, {
                $where: {key: this._userKey},
                $fields: [FIELD_NAME]
            }).then((response) => {
                const data = response.data && response.data[0] && response.data[0].userData;

                if (data) {
                    this.shouldShowLabelOnActions = !data.isRelationsFeatureUsed;
                    this.shouldShowLabelOnControl = !data.isRelationsFeatureUsed;
                    this.refresh();
                    return data;
                } else {
                    this.shouldShowLabelOnActions = true;
                    this.shouldShowLabelOnControl = true;
                    return defaultMetadata;
                }
            });
    }

    update(metadata) {
        this.shouldShowLabelOnActions = !metadata.isRelationsFeatureUsed;
        this.shouldShowLabelOnControl = !metadata.isRelationsFeatureUsed;

        this.restStorage.data(REST_STORAGE_GROUP_NAME, this._userKey, {
            isRelationsFeatureUsed: metadata.isRelationsFeatureUsed
        });
        this.refresh();
    }

    refresh() {
        const actionsButton = $(actionsButtonSelector);

        actionsButton.toggleClass(NEW_CSS_LABEL_CLASS, this.shouldShowLabelOnActions);
    }

    getClassForLegendControl() {
        return this.shouldShowLabelOnControl ? NEW_CSS_LABEL_CLASS : '';
    }
}

export default new LegendOnboarding();
