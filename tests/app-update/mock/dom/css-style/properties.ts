import { aToCProps } from "./properties/a-c.js";
import { dToLProps } from "./properties/d-l.js";
import { mToRProps } from "./properties/m-r.js";
import { sToZProps } from "./properties/s-z.js";

export const cssStringProperties = {
	...aToCProps,
	...dToLProps,
	...mToRProps,
	...sToZProps,
};
