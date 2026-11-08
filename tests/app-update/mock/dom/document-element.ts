import { cssStyleStub } from "./css-style.js";
import { elementMethods } from "./element/element-methods.js";
import { elementProperties } from "./element/element-properties.js";

export const documentElementStub = {
	style: cssStyleStub,
	...elementProperties,
	...elementMethods,
};
