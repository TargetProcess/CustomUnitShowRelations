declare module 'tau/api/actions/v1' {
    const exportValue: {
        addControl: (component: React.ReactElement<any>) => void;
        onShow: (callback: () => void) => void;
        unbind: () => void;
    };

    export default exportValue;
}
