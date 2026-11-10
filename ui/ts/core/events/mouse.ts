import { invoke, isTauriAvailable } from "../tauri-helper.js";

export const mouseMethods = {
	onGhostClick(
		clientX?: number,
		clientY?: number,
		rect?: unknown,
		scopeId: number = 0,
	) {
		if (
			(this as unknown).sakuraPlayer?.timeCritical &&
			(this as unknown).sakuraPlayer?.isPlaying
		)
			return;
		const col = (this as unknown).getCollisionInfo(
			clientX,
			clientY,
			rect,
			scopeId,
		);
		console.log(
			`🖱️ ゴーストタップ: スコープ=${scopeId}, 部位=${col.name || "なし"} (X:${col.canvasX}, Y:${col.canvasY})`,
		);
		if (isTauriAvailable()) {
			invoke("on_mouse_click").catch(() => {});
		}

		const args = [col.canvasX, col.canvasY, 0, scopeId, col.name || "", 0];

		(this as unknown).ghostController
			.sendShioriEvent("OnMouseDoubleClick", args)
			.then((res: unknown) => {
				if (res?.status === 200 && res?.value) {
					(this as unknown).playSakuraScript?.(res.value);
				} else {
					(this as unknown).ghostController.sendShioriEvent(
						"OnMouseClick",
						args,
					).then((clickRes: unknown) => {
						if (clickRes?.status === 200 && clickRes?.value) {
							(this as unknown).playSakuraScript?.(clickRes.value);
						}
					});
				}
			});
	},

	onGhostStroke(
		clientX?: number,
		clientY?: number,
		rect?: unknown,
		scopeId: number = 0,
	) {
		if (
			(this as unknown).sakuraPlayer?.timeCritical &&
			(this as unknown).sakuraPlayer?.isPlaying
		)
			return;
		const col = (this as unknown).getCollisionInfo(
			clientX,
			clientY,
			rect,
			scopeId,
		);
		console.log(
			`🖐️ ゴースト撫で（Stroke）: スコープ=${scopeId}, 部位=${col.name || "なし"}`,
		);
		(this as unknown).ghostController.sendShioriEvent("OnMouseMove", [
			col.canvasX,
			col.canvasY,
			0,
			scopeId,
			col.name || "",
		]);
	},

	onGhostMouseEnter(
		clientX?: number,
		clientY?: number,
		rect?: unknown,
		scopeId: number = 0,
		isWindow: boolean = false,
	) {
		if (
			(this as unknown).sakuraPlayer?.timeCritical &&
			(this as unknown).sakuraPlayer?.isPlaying
		)
			return;
		const col = (this as unknown).getCollisionInfo(
			clientX,
			clientY,
			rect,
			scopeId,
		);
		const eventName = isWindow ? "OnMouseEnterAll" : "OnMouseEnter";
		(this as unknown).ghostController.sendShioriEvent(eventName, [
			col.canvasX,
			col.canvasY,
			0,
			scopeId,
			col.name || "",
			0,
			"mouse",
		]);
	},

	onGhostMouseLeave(
		clientX?: number,
		clientY?: number,
		rect?: unknown,
		scopeId: number = 0,
		isWindow: boolean = false,
	) {
		if (
			(this as unknown).sakuraPlayer?.timeCritical &&
			(this as unknown).sakuraPlayer?.isPlaying
		)
			return;
		const col = (this as unknown).getCollisionInfo(
			clientX,
			clientY,
			rect,
			scopeId,
		);
		const eventName = isWindow ? "OnMouseLeaveAll" : "OnMouseLeave";
		(this as unknown).ghostController.sendShioriEvent(eventName, [
			col.canvasX,
			col.canvasY,
			0,
			scopeId,
			col.name || "",
			0,
			"mouse",
		]);
	},

	onGhostMouseEx(
		type: string,
		clientX?: number,
		clientY?: number,
		rect?: unknown,
		button: string | number = "middle",
		device: string = "mouse",
		scopeId: number = 0,
	) {
		if (
			(this as unknown).sakuraPlayer?.timeCritical &&
			(this as unknown).sakuraPlayer?.isPlaying
		)
			return;
		const col = (this as unknown).getCollisionInfo(
			clientX,
			clientY,
			rect,
			scopeId,
		);
		const eventName = type === "up" ? "OnMouseUpEx" : "OnMouseDownEx";
		(this as unknown).ghostController.sendShioriEvent(eventName, [
			col.canvasX,
			col.canvasY,
			0,
			scopeId,
			col.name || "",
			button,
			device,
		]);
	},

	onGhostMouseClickEx(
		clientX?: number,
		clientY?: number,
		rect?: unknown,
		button: string | number = "middle",
		device: string = "mouse",
		scopeId: number = 0,
		isDouble: boolean = false,
	) {
		if (
			(this as unknown).sakuraPlayer?.timeCritical &&
			(this as unknown).sakuraPlayer?.isPlaying
		)
			return;
		const col = (this as unknown).getCollisionInfo(
			clientX,
			clientY,
			rect,
			scopeId,
		);
		const eventName = isDouble ? "OnMouseDoubleClickEx" : "OnMouseClickEx";
		(this as unknown).ghostController.sendShioriEvent(eventName, [
			col.canvasX,
			col.canvasY,
			0,
			scopeId,
			col.name || "",
			button,
			device,
		]);
	},

	onGhostMultipleClick(
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
			(this as unknown).sakuraPlayer?.timeCritical &&
			(this as unknown).sakuraPlayer?.isPlaying
		)
			return;
		const col = (this as unknown).getCollisionInfo(
			clientX,
			clientY,
			rect,
			scopeId,
		);
		const eventName = isEx ? "OnMouseMultipleClickEx" : "OnMouseMultipleClick";
		(this as unknown).ghostController.sendShioriEvent(eventName, [
			col.canvasX,
			col.canvasY,
			0,
			scopeId,
			col.name || "",
			button,
			device,
			count,
		]);
	},

	onGhostGesture(
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
			(this as unknown).sakuraPlayer?.timeCritical &&
			(this as unknown).sakuraPlayer?.isPlaying
		)
			return;
		const coord = (x: number, y: number) => `${x}\x01${y}`;
		(this as unknown).ghostController.sendShioriEvent("OnMouseGesture", [
			scopeId,
			coord(endX, endY),
			endPart || "",
			coord(startX, startY),
			startPart || "",
			direction,
		]);
	},

	onGhostMouseDown(
		clientX?: number,
		clientY?: number,
		rect?: unknown,
		button: number = 0,
		device: string = "mouse",
		scopeId: number = 0,
	) {
		if (
			(this as unknown).sakuraPlayer?.timeCritical &&
			(this as unknown).sakuraPlayer?.isPlaying
		)
			return;
		const col = (this as unknown).getCollisionInfo(
			clientX,
			clientY,
			rect,
			scopeId,
		);
		(this as unknown).ghostController.sendShioriEvent("OnMouseDown", [
			col.canvasX,
			col.canvasY,
			0,
			scopeId,
			col.name || "",
			button,
			device,
		]);
	},

	onGhostMouseUp(
		clientX?: number,
		clientY?: number,
		rect?: unknown,
		button: number = 0,
		device: string = "mouse",
		scopeId: number = 0,
	) {
		if (
			(this as unknown).sakuraPlayer?.timeCritical &&
			(this as unknown).sakuraPlayer?.isPlaying
		)
			return;
		const col = (this as unknown).getCollisionInfo(
			clientX,
			clientY,
			rect,
			scopeId,
		);
		(this as unknown).ghostController.sendShioriEvent("OnMouseUp", [
			col.canvasX,
			col.canvasY,
			0,
			scopeId,
			col.name || "",
			button,
			device,
		]);
	},

	onGhostWheel(
		clientX?: number,
		clientY?: number,
		rect?: unknown,
		delta: number = 0,
		scopeId: number = 0,
	) {
		if (
			(this as unknown).sakuraPlayer?.timeCritical &&
			(this as unknown).sakuraPlayer?.isPlaying
		)
			return;
		const col = (this as unknown).getCollisionInfo(
			clientX,
			clientY,
			rect,
			scopeId,
		);
		(this as unknown).ghostController.sendShioriEvent("OnMouseWheel", [
			col.canvasX,
			col.canvasY,
			delta,
			scopeId,
			col.name || "",
		]);
	},

	onGhostDragStart(
		clientX?: number,
		clientY?: number,
		rect?: unknown,
		scopeId: number = 0,
	) {
		if (
			(this as unknown).sakuraPlayer?.timeCritical &&
			(this as unknown).sakuraPlayer?.isPlaying
		)
			return;
		const col = (this as unknown).getCollisionInfo(
			clientX,
			clientY,
			rect,
			scopeId,
		);
		(this as unknown).ghostController.sendShioriEvent("OnMouseDragStart", [
			col.canvasX,
			col.canvasY,
			0,
			scopeId,
			col.name || "",
		]);
	},

	onGhostDragEnd(
		clientX?: number,
		clientY?: number,
		rect?: unknown,
		scopeId: number = 0,
	) {
		if (
			(this as unknown).sakuraPlayer?.timeCritical &&
			(this as unknown).sakuraPlayer?.isPlaying
		)
			return;
		const col = (this as unknown).getCollisionInfo(
			clientX,
			clientY,
			rect,
			scopeId,
		);
		(this as unknown).ghostController.sendShioriEvent("OnMouseDragEnd", [
			col.canvasX,
			col.canvasY,
			0,
			scopeId,
			col.name || "",
		]);
	},

	onGhostHover(
		clientX?: number,
		clientY?: number,
		rect?: unknown,
		scopeId: number = 0,
	) {
		if (
			(this as unknown).sakuraPlayer?.timeCritical &&
			(this as unknown).sakuraPlayer?.isPlaying
		)
			return;
		const col = (this as unknown).getCollisionInfo(
			clientX,
			clientY,
			rect,
			scopeId,
		);
		(this as unknown).ghostController.sendShioriEvent("OnMouseHover", [
			col.canvasX,
			col.canvasY,
			0,
			scopeId,
			col.name || "",
		]);
	},

	getCollisionInfo(
		clientX?: number,
		clientY?: number,
		rect?: unknown,
		scopeId: number = 0,
	) {
		if (
			clientX !== undefined &&
			clientY !== undefined &&
			rect &&
			(this as unknown).surfaceManager
		) {
			return (this as unknown).surfaceManager.detectCollision(
				clientX,
				clientY,
				rect,
				null,
				scopeId,
			);
		}
		return { name: "", canvasX: 0, canvasY: 0 };
	},

	detectPart(clientX?: number, clientY?: number, rect?: unknown) {
		return (this as unknown).getCollisionInfo(clientX, clientY, rect).name;
	},
};
