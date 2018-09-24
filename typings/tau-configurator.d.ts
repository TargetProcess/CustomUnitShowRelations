declare module 'tau/configurator' {
    const exportValue: {
        getApplicationPath: () => string;
        getBusRegistry: () => any;
    };

    export default exportValue;
}
