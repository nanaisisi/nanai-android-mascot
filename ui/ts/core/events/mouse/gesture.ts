/**
 * @file gesture.ts
 * @brief Gesture mouse event handler
 */

import { dispatchShioriMouseEvent, isTimeCriticalPlaying } from "./click.js";

export function onGhostGesture(
	this: unknown,
	startX: number,
	startY: number,
	startPart: string,
	endX: number,
	endY: number,
	endPart: string,
	direction: string,
	scopeId: number = 0,
) {
	if (isTimeCriticalPlaying(this)) return;
	const coord = (x: number, y: number) => `${x}\x01${y}`;
	return dispatchShioriMouseEvent(this, "OnMouseGesture", [
		scopeId,
		coord(endX, endY),
		endPart || "",
		coord(startX, startY),
		startPart || "",
		direction,
	]);
}
