/**
 * @file hover.ts
 * @brief Mouse enter, leave, and hover event handlers
 */

import {
	dispatchCollisionMouseEvent,
	dispatchShioriMouseEvent,
	isTimeCriticalPlaying,
	type MouseApp,
} from "./click.js";

const lastPartByApp = new WeakMap<object, Map<number, string>>();

function getAppPartMap(app: unknown): Map<number, string> | null {
	if (!app || (typeof app !== "object" && typeof app !== "function")) {
		return null;
	}
	let scopeMap = lastPartByApp.get(app);
	if (!scopeMap) {
		scopeMap = new Map<number, string>();
		lastPartByApp.set(app, scopeMap);
	}
	return scopeMap;
}

export function clearPartTracking(app: unknown, scopeId: number = 0): void {
	const scopeMap = getAppPartMap(app);
	scopeMap?.delete(scopeId);
}

export function trackPartTransition(
	app: unknown,
	clientX?: number,
	clientY?: number,
	rect?: unknown,
	scopeId: number = 0,
): Promise<void> {
	const a = app as MouseApp | null | undefined;
	if (!a || isTimeCriticalPlaying(a)) return Promise.resolve();
	if (typeof a.getCollisionInfo !== "function") return Promise.resolve();
	const scopeMap = getAppPartMap(a);
	if (!scopeMap) return Promise.resolve();

	const col = a.getCollisionInfo(clientX, clientY, rect, scopeId) ?? {
		name: "",
		canvasX: 0,
		canvasY: 0,
	};
	const canvasX = col.canvasX ?? 0;
	const canvasY = col.canvasY ?? 0;
	const nextPart = col.name || "";
	const prevPart = scopeMap.get(scopeId) || "";

	if (prevPart === nextPart) return Promise.resolve();

	const canSend = typeof a.ghostController?.sendShioriEvent === "function";
	const pending: Promise<unknown>[] = [];

	if (prevPart && canSend) {
		pending.push(
			dispatchShioriMouseEvent(a, "OnMouseLeave", [
				canvasX,
				canvasY,
				0,
				scopeId,
				prevPart,
				0,
				"mouse",
			]),
		);
	}

	scopeMap.set(scopeId, nextPart);

	if (nextPart && canSend) {
		pending.push(
			dispatchShioriMouseEvent(a, "OnMouseEnter", [
				canvasX,
				canvasY,
				0,
				scopeId,
				nextPart,
				0,
				"mouse",
			]),
		);
	}

	return pending.length > 0
		? Promise.all(pending).then(() => undefined)
		: Promise.resolve();
}

export function resetPartTracking(
	app: unknown,
	scopeId: number = 0,
	clientX?: number,
	clientY?: number,
	rect?: unknown,
): Promise<void> {
	const a = app as MouseApp | null | undefined;
	if (!a) return Promise.resolve();
	const scopeMap = getAppPartMap(a);
	if (!scopeMap) return Promise.resolve();

	const prevPart = scopeMap.get(scopeId) || "";
	scopeMap.delete(scopeId);
	if (!prevPart || isTimeCriticalPlaying(a)) return Promise.resolve();
	if (typeof a.ghostController?.sendShioriEvent !== "function") {
		return Promise.resolve();
	}

	const col =
		clientX !== undefined &&
		clientY !== undefined &&
		typeof a.getCollisionInfo === "function"
			? a.getCollisionInfo(clientX, clientY, rect, scopeId)
			: null;
	const canvasX = col?.canvasX ?? 0;
	const canvasY = col?.canvasY ?? 0;

	return dispatchShioriMouseEvent(a, "OnMouseLeave", [
		canvasX,
		canvasY,
		0,
		scopeId,
		prevPart,
		0,
		"mouse",
	]).then(() => undefined);
}

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
