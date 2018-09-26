import globalConfigurator from 'tau/configurator';

const API_V1_PATH = `${globalConfigurator.getApplicationPath()}/api/v1`;

function convertToNativePromise<T>(jqueryPromise: JQuery.jqXHR<T>): Promise<T> {
    return new Promise((resolve, reject) => {
        jqueryPromise.then(resolve, reject);
    });
}

function load<T>(url: string, params?: object) {
    return convertToNativePromise<T>($.ajax({
        type: 'get',
        url,
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        data: params
    }));
}

async function loadPages<T>(url: string, params?: object): Promise<T[]> {
    const { Items, Next } = await load<{ Items: T[], Next: string }>(url, params);
    if (!Next) {
        return Items;
    }

    const additionalItems = await loadPages<T>(Next, params);
    return [...Items, ...additionalItems];
}

export async function loadResource<T>(resource: string, params?: object) {
    const resourceUrl = `${API_V1_PATH}/${resource}`;
    return load<T>(resourceUrl, params);
}

export async function loadCollection<T>(resource: string, params?: object) {
    const resourceUrl = `${API_V1_PATH}/${resource}`;
    return loadPages<T>(resourceUrl, params);
}
