/// <reference types="svelte" />
declare module "*.svelte" {
    import { SvelteComponentTyped } from "svelte";
    export default class Component<
        Props = {},
        Events = Record<string, CustomEvent<any>>,
        Slots = Record<string, any>
    > extends SvelteComponentTyped<Props, Events, Slots> { }
}
