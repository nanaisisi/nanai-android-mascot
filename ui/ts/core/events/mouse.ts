/**
 * @file mouse.ts
 * @brief Mouse events collection combining collision, click, hover, buttons, and gesture handlers
 */

import { getCollisionInfo, detectPart } from "./mouse/collision.js";
import { onGhostClick, onGhostStroke, onGhostMultipleClick } from "./mouse/click.js";
import { onGhostMouseEnter, onGhostMouseLeave, onGhostHover } from "./mouse/hover.js";
import {
	onGhostMouseDown,
	onGhostMouseUp,
	onGhostMouseEx,
	onGhostMouseClickEx,
	onGhostWheel,
	onGhostDragStart,
	onGhostDragEnd,
} from "./mouse/buttons.js";
import { onGhostGesture } from "./mouse/gesture.js";

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
