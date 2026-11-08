import { cssStyleMethods } from "./methods.js";
import { cssStringProperties } from "./properties.js";

export const cssStyleStub = {
	...cssStringProperties,
	...cssStyleMethods,
};
