export default function differenceBy<T>(array: T[], other: T[], comparator: (el1: T, el2: T) => boolean): T[] {
    return array.filter((element) => !hasElementInArray(other, element, comparator));
}

function hasElementInArray<T>(array: T[], element: T, comparator: (el1: T, el2: T) => boolean): boolean {
    return array.some((arrayElement) => comparator(arrayElement, element));
}
