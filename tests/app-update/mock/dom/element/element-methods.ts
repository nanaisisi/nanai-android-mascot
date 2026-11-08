import { elementAttributes } from "./element-methods/attributes.js";
import { elementEvents } from "./element-methods/events.js";
import { elementMisc } from "./element-methods/misc.js";
import { elementNodes } from "./element-methods/nodes.js";
import { elementSelectors } from "./element-methods/selectors.js";

export const elementMethods = {
	...elementAttributes,
	...elementEvents,
	...elementMisc,
	...elementNodes,
	...elementSelectors,
};
