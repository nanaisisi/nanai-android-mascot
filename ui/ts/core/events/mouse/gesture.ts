/**
 * @file gesture.ts
 * @brief Gesture mouse event handler
 */

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
	if (
		(this as unknown as import("../../../../main.js").NanaiAndroidMascotApp)
			.sakuraPlayer?.timeCritical &&
		(this as unknown as import("../../../../main.js").NanaiAndroidMascotApp)
			.sakuraPlayer?.isPlaying
	)
		return;
	const coord = (x: number, y: number) => `${x}\x01${y}`;
	(
		this as unknown as import("../../../../main.js").NanaiAndroidMascotApp
	).ghostController.sendShioriEvent("OnMouseGesture", [
		scopeId,
		coord(endX, endY),
		endPart || "",
		coord(startX, startY),
		startPart || "",
		direction,
	]);
}
