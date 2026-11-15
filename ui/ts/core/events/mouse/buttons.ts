/**
 * @file buttons.ts
 * @brief Mouse down, up, ex, wheel, and drag event handlers
 */

export function onGhostMouseDown(
	this: unknown,
	clientX?: number,
	clientY?: number,
	rect?: unknown,
	button: number = 0,
	device: string = "mouse",
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
	).ghostController.sendShioriEvent("OnMouseDown", [
		col.canvasX,
		col.canvasY,
		0,
		scopeId,
		col.name || "",
		button,
		device,
	]);
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
	).ghostController.sendShioriEvent("OnMouseUp", [
		col.canvasX,
		col.canvasY,
		0,
		scopeId,
		col.name || "",
		button,
		device,
	]);
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
	const eventName = type === "up" ? "OnMouseUpEx" : "OnMouseDownEx";
	(
		this as unknown as import("../../../../main.js").NanaiAndroidMascotApp
	).ghostController.sendShioriEvent(eventName, [
		col.canvasX,
		col.canvasY,
		0,
		scopeId,
		col.name || "",
		button,
		device,
	]);
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
	const eventName = isDouble ? "OnMouseDoubleClickEx" : "OnMouseClickEx";
	(
		this as unknown as import("../../../../main.js").NanaiAndroidMascotApp
	).ghostController.sendShioriEvent(eventName, [
		col.canvasX,
		col.canvasY,
		0,
		scopeId,
		col.name || "",
		button,
		device,
	]);
}

export function onGhostWheel(
	this: unknown,
	clientX?: number,
	clientY?: number,
	rect?: unknown,
	delta: number = 0,
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
	).ghostController.sendShioriEvent("OnMouseWheel", [
		col.canvasX,
		col.canvasY,
		delta,
		scopeId,
		col.name || "",
	]);
}

export function onGhostDragStart(
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
	).ghostController.sendShioriEvent("OnMouseDragStart", [
		col.canvasX,
		col.canvasY,
		0,
		scopeId,
		col.name || "",
	]);
}

export function onGhostDragEnd(
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
	).ghostController.sendShioriEvent("OnMouseDragEnd", [
		col.canvasX,
		col.canvasY,
		0,
		scopeId,
		col.name || "",
	]);
}
