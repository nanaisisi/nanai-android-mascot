/**
 * @file collision.ts
 * @brief Collision detection and part detection helpers for mouse events
 */

export function getCollisionInfo(
	this: unknown,
	clientX?: number,
	clientY?: number,
	rect?: unknown,
	scopeId: number = 0,
) {
	if (
		clientX !== undefined &&
		clientY !== undefined &&
		rect &&
		(this as unknown as import("../../../../main.js").NanaiAndroidMascotApp)
			.surfaceManager
	) {
		return (
			this as unknown as import("../../../../main.js").NanaiAndroidMascotApp
		).surfaceManager.detectCollision(clientX, clientY, rect, null, scopeId);
	}
	return { name: "", canvasX: 0, canvasY: 0 };
}

export function detectPart(
	this: unknown,
	clientX?: number,
	clientY?: number,
	rect?: unknown,
) {
	return (
		this as unknown as import("../../../../main.js").NanaiAndroidMascotApp
	).getCollisionInfo(clientX, clientY, rect).name;
}
