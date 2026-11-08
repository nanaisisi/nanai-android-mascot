import { documentElementStub } from "./dom/document-element.js";

globalThis.window = globalThis;
globalThis.document = {
	documentElement: documentElementStub,
	querySelector: () => null,
};
