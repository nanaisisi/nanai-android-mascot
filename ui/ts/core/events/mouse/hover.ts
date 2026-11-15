/**
 * @file hover.ts
 * @brief Mouse enter, leave, and hover event handlers
 */

export function onGhostMouseEnter(
	this: unknown,
	clientX?: number,
	clientY?: number,
	rect?: unknown,
	scopeId: number = 0,
	isWindow: boolean = false,
) {
	if (
		(this as unknown as import("../../../../main.js").NanaiAndroidMascotApp)
			.sakuraPlayer?.timeCritical &&
		(this as unknown as import("../../../../main.js").NanaiAndroidMascotApp)
			.sakuraPlayer?.isPlaying
	)
		return;
	const col = (
		this as unknown as import("../../../../main.js").NanaiAndroidMascotApp
	).getCollisionInfo(clientX, clientY, rect, scopeId);
	const eventName = isWindow ? "OnMouseEnterAll" : "OnMouseEnter";
	(
		this as unknown as import("../../../../main.js").NanaiAndroidMascotApp
	).ghostController.sendShioriEvent(eventName, [
		col.canvasX,
		col.canvasY,
		0,
		scopeId,
		col.name || "",
		0,
		"mouse",
	]);
}

export function onGhostMouseLeave(
	this: unknown,
	clientX?: number,
	clientY?: number,
	rect?: unknown,
	scopeId: number = 0,
	isWindow: boolean = false,
) {
	if (
		(this as unknown as import("../../../../main.js").NanaiAndroidMascotApp)
			.sakuraPlayer?.timeCritical &&
		(this as unknown as import("../../../../main.js").NanaiAndroidMascotApp)
			.sakuraPlayer?.isPlaying
	)
		return;
	const col = (
		this as unknown as import("../../../../main.js").NanaiAndroidMascotApp
	).getCollisionInfo(clientX, clientY, rect, scopeId);
	const eventName = isWindow ? "OnMouseLeaveAll" : "OnMouseLeave";
	(
		this as unknown as import("../../../../main.js").NanaiAndroidMascotApp
	).ghostController.sendShioriEvent(eventName, [
		col.canvasX,
		col.canvasY,
		0,
		scopeId,
		col.name || "",
		0,
		"mouse",
	]);
}

export function onGhostHover(
	this: unknown,
	clientX?: number,
	clientY?: number,
	rect?: unknown,
	scopeId: number = 0,
) {
	if (
		(this as unknown as import("../../../../main.js").NanaiAndroidMascotApp)
			.sakuraPlayer?.timeCritical &&
		(this as unknown as import("../../../../main.js").NanaiAndroidMascotApp)
			.sakuraPlayer?.isPlaying
	)
		return;
	const col = (
		this as unknown as import("../../../../main.js").NanaiAndroidMascotApp
	).getCollisionInfo(clientX, clientY, rect, scopeId);
	(
		this as unknown as import("../../../../main.js").NanaiAndroidMascotApp
	).ghostController.sendShioriEvent("OnMouseHover", [
		col.canvasX,
		col.canvasY,
		0,
		scopeId,
		col.name || "",
	]);
}
