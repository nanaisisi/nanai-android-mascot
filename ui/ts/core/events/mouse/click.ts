/**
 * @file click.ts
 * @brief Click, stroke, and multiple-click mouse event handlers
 */

import { invoke, isTauriAvailable } from "../../tauri-helper.js";

export function onGhostClick(
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
	console.log(
		`🖱️ ゴーストタップ: スコープ=${scopeId}, 部位=${col.name || "なし"} (X:${col.canvasX}, Y:${col.canvasY})`,
	);
	if (isTauriAvailable()) {
		invoke("on_mouse_click").catch(() => {});
	}

	const args = [col.canvasX, col.canvasY, 0, scopeId, col.name || "", 0];

	(
		this as unknown as import("../../../../main.js").NanaiAndroidMascotApp
	).ghostController
		.sendShioriEvent("OnMouseDoubleClick", args)
		.then((res: unknown) => {
			const r = res as { status?: number; value?: unknown } | null;
			if (r?.status === 200 && r?.value) {
				(
					this as unknown as import("../../../../main.js").NanaiAndroidMascotApp
				).playSakuraScript?.(r.value);
			} else {
				(
					this as unknown as import("../../../../main.js").NanaiAndroidMascotApp
				).ghostController
					.sendShioriEvent("OnMouseClick", args)
					.then((clickRes: unknown) => {
						const cr = clickRes as {
							status?: number;
							value?: unknown;
						} | null;
						if (cr?.status === 200 && cr?.value) {
							(
								this as unknown as import("../../../../main.js").NanaiAndroidMascotApp
							).playSakuraScript?.(cr.value);
						}
					});
			}
		});
}

export function onGhostStroke(
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
	console.log(
		`🖐️ ゴースト撫で（Stroke）: スコープ=${scopeId}, 部位=${col.name || "なし"}`,
	);
	(
		this as unknown as import("../../../../main.js").NanaiAndroidMascotApp
	).ghostController.sendShioriEvent("OnMouseMove", [
		col.canvasX,
		col.canvasY,
		0,
		scopeId,
		col.name || "",
	]);
}

export function onGhostMultipleClick(
	this: unknown,
	clientX?: number,
	clientY?: number,
	rect?: unknown,
	count: number = 3,
	button: number = 0,
	device: string = "mouse",
	scopeId: number = 0,
	isEx: boolean = false,
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
	const eventName = isEx ? "OnMouseMultipleClickEx" : "OnMouseMultipleClick";
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
		count,
	]);
}
