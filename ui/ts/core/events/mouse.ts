/**
 * @file mouse.ts
 * @brief Mouse events collection combining collision, click, hover, buttons, and gesture handlers
 */

import {
	onGhostDragEnd,
	onGhostDragStart,
	onGhostMouseClickEx,
	onGhostMouseDown,
	onGhostMouseEx,
	onGhostMouseUp,
	onGhostWheel,
} from "./mouse/buttons.js";
import {
	onGhostClick,
	onGhostMultipleClick,
	onGhostStroke,
} from "./mouse/click.js";
import { detectPart, getCollisionInfo } from "./mouse/collision.js";
import { onGhostGesture } from "./mouse/gesture.js";
import {
	onGhostHover,
	onGhostMouseEnter,
	onGhostMouseLeave,
} from "./mouse/hover.js";

export const mouseMethods = {
	getCollisionInfo,
	detectPart,
	onGhostClick,
	onGhostStroke,
	onGhostMultipleClick,
	onGhostMouseEnter,
	onGhostMouseLeave,
	onGhostHover,
	onGhostMouseDown,
	onGhostMouseUp,
	onGhostMouseEx,
	onGhostMouseClickEx,
	onGhostWheel,
	onGhostDragStart,
	onGhostDragEnd,
	onGhostGesture,
};
