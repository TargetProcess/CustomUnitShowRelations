declare module 'libs/classNames' {
    type ClassValue = string | number | Record<string, any> | undefined | null | boolean;

    type ClassNamesFn = (...classes: ClassValue[]) => string;

    type ClassNamesExport = ClassNamesFn & { default: ClassNamesFn };

    const classNames: ClassNamesExport;

    export = classNames;
}
