import { setupMethods } from "./events/setup.js";
import { mouseMethods } from "./events/mouse.js";

export const eventMethods = {
	...setupMethods,
	...mouseMethods,
};
