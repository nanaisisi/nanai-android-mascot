import { mouseMethods } from "./events/mouse.js";
import { setupMethods } from "./events/setup.js";

export const eventMethods = {
	...setupMethods,
	...mouseMethods,
};
