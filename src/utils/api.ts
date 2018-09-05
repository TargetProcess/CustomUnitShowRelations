import globalConfigurator from 'tau/configurator';

function loadSimple(url: string, params?: object): JQueryPromise<any> {
    return $.ajax({
        type: 'get',
        url,
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        data: params
    });
}

function loadPages(url: string, params?: object): JQueryPromise<any> {
    return loadSimple(url, params)
        .then(({ Items, Next }) =>
            (Next ? (loadPages(Next).then((pageItems) => Items.concat(pageItems))) : Items));
}

function convertToNativePromise<T>(jqueryPromise: JQueryPromise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
        jqueryPromise.then(resolve, reject);
    });
}

export function load<T>(resource: string, params?: object) {
    return convertToNativePromise<T>(loadPages(`${globalConfigurator.getApplicationPath()}/api/v1/${resource}`, params));
}
