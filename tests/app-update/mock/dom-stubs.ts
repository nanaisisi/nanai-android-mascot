import { documentElementStub } from "./dom/document-element.js";

globalThis.window = globalThis as unknown as Window & typeof globalThis;
globalThis.document = {
	documentElement: documentElementStub as unknown as HTMLElement,
	querySelector: () => null,
} as unknown as Document;
