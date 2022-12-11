export {}

declare global {
    interface Window {
        __DUBHE_MODEL__: string[];
        __DUBHE_EMIT__:any
        __DUBHE_NAMESPACE__:any

        [key:string]:any
    }
}