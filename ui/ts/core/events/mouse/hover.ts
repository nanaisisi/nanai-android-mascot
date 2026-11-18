/**
 * @file hover.ts
 * @brief Mouse enter, leave, and hover event handlers
 */

import { dispatchCollisionMouseEvent } from "./click.js";

export function onGhostMouseEnter(
	this: unknown,
	clientX?: number,
	clientY?: number,
	rect?: unknown,
	scopeId: number = 0,
	isWindow: boolean = false,
) {
	const eventName = isWindow ? "OnMouseEnterAll" : "OnMouseEnter";
	return dispatchCollisionMouseEvent(
		this,
		clientX,
		clientY,
		rect,
		scopeId,
		eventName,
		(col) => [col.canvasX, col.canvasY, 0, scopeId, col.name || "", 0, "mouse"],
	);
}

export function onGhostMouseLeave(
	this: unknown,
	clientX?: number,
	clientY?: number,
	rect?: unknown,
	scopeId: number = 0,
	isWindow: boolean = false,
) {
	const eventName = isWindow ? "OnMouseLeaveAll" : "OnMouseLeave";
	return dispatchCollisionMouseEvent(
		this,
		clientX,
		clientY,
		rect,
		scopeId,
		eventName,
		(col) => [col.canvasX, col.canvasY, 0, scopeId, col.name || "", 0, "mouse"],
	);
}

export function onGhostHover(
	this: unknown,
	clientX?: number,
	clientY?: number,
	rect?: unknown,
	scopeId: number = 0,
) {
	return dispatchCollisionMouseEvent(
		this,
		clientX,
		clientY,
		rect,
		scopeId,
		"OnMouseHover",
		(col) => [col.canvasX, col.canvasY, 0, scopeId, col.name || ""],
	);
}
