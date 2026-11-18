/**
 * @file buttons.ts
 * @brief Mouse down, up, ex, wheel, and drag event handlers
 */

import { dispatchCollisionMouseEvent } from "./click.js";

export function onGhostMouseDown(
	this: unknown,
	clientX?: number,
	clientY?: number,
	rect?: unknown,
	button: number = 0,
	device: string = "mouse",
	scopeId: number = 0,
) {
	return dispatchCollisionMouseEvent(
		this,
		clientX,
		clientY,
		rect,
		scopeId,
		"OnMouseDown",
		(col) => [
			col.canvasX,
			col.canvasY,
			0,
			scopeId,
			col.name || "",
			button,
			device,
		],
	);
}

export function onGhostMouseUp(
	this: unknown,
	clientX?: number,
	clientY?: number,
	rect?: unknown,
	button: number = 0,
	device: string = "mouse",
	scopeId: number = 0,
) {
	return dispatchCollisionMouseEvent(
		this,
		clientX,
		clientY,
		rect,
		scopeId,
		"OnMouseUp",
		(col) => [
			col.canvasX,
			col.canvasY,
			0,
			scopeId,
			col.name || "",
			button,
			device,
		],
	);
}

export function onGhostMouseEx(
	this: unknown,
	type: string,
	clientX?: number,
	clientY?: number,
	rect?: unknown,
	button: string | number = "middle",
	device: string = "mouse",
	scopeId: number = 0,
) {
	const eventName = type === "up" ? "OnMouseUpEx" : "OnMouseDownEx";
	return dispatchCollisionMouseEvent(
		this,
		clientX,
		clientY,
		rect,
		scopeId,
		eventName,
		(col) => [
			col.canvasX,
			col.canvasY,
			0,
			scopeId,
			col.name || "",
			button,
			device,
		],
	);
}

export function onGhostMouseClickEx(
	this: unknown,
	clientX?: number,
	clientY?: number,
	rect?: unknown,
	button: string | number = "middle",
	device: string = "mouse",
	scopeId: number = 0,
	isDouble: boolean = false,
) {
	const eventName = isDouble ? "OnMouseDoubleClickEx" : "OnMouseClickEx";
	return dispatchCollisionMouseEvent(
		this,
		clientX,
		clientY,
		rect,
		scopeId,
		eventName,
		(col) => [
			col.canvasX,
			col.canvasY,
			0,
			scopeId,
			col.name || "",
			button,
			device,
		],
	);
}

export function onGhostWheel(
	this: unknown,
	clientX?: number,
	clientY?: number,
	rect?: unknown,
	delta: number = 0,
	scopeId: number = 0,
) {
	return dispatchCollisionMouseEvent(
		this,
		clientX,
		clientY,
		rect,
		scopeId,
		"OnMouseWheel",
		(col) => [col.canvasX, col.canvasY, delta, scopeId, col.name || ""],
	);
}

export function onGhostDragStart(
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
		"OnMouseDragStart",
		(col) => [col.canvasX, col.canvasY, 0, scopeId, col.name || ""],
	);
}

export function onGhostDragEnd(
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
		"OnMouseDragEnd",
		(col) => [col.canvasX, col.canvasY, 0, scopeId, col.name || ""],
	);
}
