

export const mouseMethods = {
	onGhostClick(
		_clientX?: number,
		_clientY?: number,
<<<<<<< HEAD
		rect?: unknown,
		scopeId: number = 0,
	) {
		if (
			(this as unknown).sakuraPlayer?.timeCritical &&
			(this as unknown).sakuraPlayer?.isPlaying
		)
			return;
		const _col = (this as unknown).getCollisionInfo(
			clientX,
			clientY,
			rect,
			scopeId,
		);
=======
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		rect?: any,
		scopeId: number = 0,
	) {
		if (
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			(this as any).sakuraPlayer?.timeCritical &&
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			(this as any).sakuraPlayer?.isPlaying
		)
			return;
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		const _col = (this as any).getCollisionInfo(clientX, clientY, rect, scopeId);
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
		console.log(
			`🖱️ ゴーストタップ: スコープ=$scopeId, 部位=$col.name || "なし"(_X:${col.canvasX}, _Y:${col.canvasY})`,
		);
		if (isTauriAvailable()) {
			invoke("on_mouse_click").catch(() => {});
		}

		const args = [col.canvasX, col.canvasY, 0, scopeId, col.name || "", 0];

<<<<<<< HEAD
		(this as unknown).ghostController
			.sendShioriEvent("OnMouseDoubleClick", args)
			.then((res: unknown) => {
				if (!res?.script) {
					(this as unknown).ghostController.sendShioriEvent(
						"OnMouseClick",
						args,
					);
=======
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		(this as any).ghostController
			.sendShioriEvent("OnMouseDoubleClick", args)
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			.then((res: any) => {
				if (!res?.script) {
					// biome-ignore lint/suspicious/noExplicitAny: automated fix
					(this as any).ghostController.sendShioriEvent("OnMouseClick", args);
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
				}
			});
	},

	onGhostStroke(
		clientX?: number,
		clientY?: number,
<<<<<<< HEAD
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
			`🖐️ ゴースト撫で（Stroke）: スコープ=$scopeId, 部位=$col.name || "なし"`,
		);
		(this as unknown).ghostController.sendShioriEvent("OnMouseMove", [
=======
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		rect?: any,
		scopeId: number = 0,
	) {
		if (
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			(this as any).sakuraPlayer?.timeCritical &&
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			(this as any).sakuraPlayer?.isPlaying
		)
			return;
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		const col = (this as any).getCollisionInfo(clientX, clientY, rect, scopeId);
		console.log(
			`🖐️ ゴースト撫で（Stroke）: スコープ=$scopeId, 部位=$col.name || "なし"`,
		);
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		(this as any).ghostController.sendShioriEvent("OnMouseMove", [
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
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
<<<<<<< HEAD
		rect?: unknown,
=======
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		rect?: any,
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
		scopeId: number = 0,
		isWindow: boolean = false,
	) {
		if (
<<<<<<< HEAD
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
=======
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			(this as any).sakuraPlayer?.timeCritical &&
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			(this as any).sakuraPlayer?.isPlaying
		)
			return;
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		const col = (this as any).getCollisionInfo(clientX, clientY, rect, scopeId);
		const eventName = isWindow ? "OnMouseEnterAll" : "OnMouseEnter";
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		(this as any).ghostController.sendShioriEvent(eventName, [
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
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
<<<<<<< HEAD
		rect?: unknown,
=======
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		rect?: any,
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
		scopeId: number = 0,
		isWindow: boolean = false,
	) {
		if (
<<<<<<< HEAD
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
=======
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			(this as any).sakuraPlayer?.timeCritical &&
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			(this as any).sakuraPlayer?.isPlaying
		)
			return;
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		const col = (this as any).getCollisionInfo(clientX, clientY, rect, scopeId);
		const eventName = isWindow ? "OnMouseLeaveAll" : "OnMouseLeave";
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		(this as any).ghostController.sendShioriEvent(eventName, [
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
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
<<<<<<< HEAD
		rect?: unknown,
=======
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		rect?: any,
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
		button: string | number = "middle",
		device: string = "mouse",
		scopeId: number = 0,
	) {
		if (
<<<<<<< HEAD
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
=======
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			(this as any).sakuraPlayer?.timeCritical &&
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			(this as any).sakuraPlayer?.isPlaying
		)
			return;
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		const col = (this as any).getCollisionInfo(clientX, clientY, rect, scopeId);
		const eventName = type === "up" ? "OnMouseUpEx" : "OnMouseDownEx";
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		(this as any).ghostController.sendShioriEvent(eventName, [
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
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
<<<<<<< HEAD
		rect?: unknown,
=======
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		rect?: any,
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
		button: string | number = "middle",
		device: string = "mouse",
		scopeId: number = 0,
		isDouble: boolean = false,
	) {
		if (
<<<<<<< HEAD
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
=======
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			(this as any).sakuraPlayer?.timeCritical &&
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			(this as any).sakuraPlayer?.isPlaying
		)
			return;
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		const col = (this as any).getCollisionInfo(clientX, clientY, rect, scopeId);
		const eventName = isDouble ? "OnMouseDoubleClickEx" : "OnMouseClickEx";
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		(this as any).ghostController.sendShioriEvent(eventName, [
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
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
<<<<<<< HEAD
		rect?: unknown,
=======
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		rect?: any,
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
		count: number = 3,
		button: number = 0,
		device: string = "mouse",
		scopeId: number = 0,
		isEx: boolean = false,
	) {
		if (
<<<<<<< HEAD
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
=======
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			(this as any).sakuraPlayer?.timeCritical &&
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			(this as any).sakuraPlayer?.isPlaying
		)
			return;
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		const col = (this as any).getCollisionInfo(clientX, clientY, rect, scopeId);
		const eventName = isEx ? "OnMouseMultipleClickEx" : "OnMouseMultipleClick";
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		(this as any).ghostController.sendShioriEvent(eventName, [
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
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
<<<<<<< HEAD
			(this as unknown).sakuraPlayer?.timeCritical &&
			(this as unknown).sakuraPlayer?.isPlaying
		)
			return;
		const coord = (x: number, y: number) => `$x\x01$y`;
		(this as unknown).ghostController.sendShioriEvent("OnMouseGesture", [
=======
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			(this as any).sakuraPlayer?.timeCritical &&
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			(this as any).sakuraPlayer?.isPlaying
		)
			return;
		const coord = (x: number, y: number) => `$x\x01$y`;
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		(this as any).ghostController.sendShioriEvent("OnMouseGesture", [
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
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
<<<<<<< HEAD
		rect?: unknown,
=======
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		rect?: any,
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
		button: number = 0,
		device: string = "mouse",
		scopeId: number = 0,
	) {
		if (
<<<<<<< HEAD
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
=======
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			(this as any).sakuraPlayer?.timeCritical &&
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			(this as any).sakuraPlayer?.isPlaying
		)
			return;
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		const col = (this as any).getCollisionInfo(clientX, clientY, rect, scopeId);
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		(this as any).ghostController.sendShioriEvent("OnMouseDown", [
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
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
<<<<<<< HEAD
		rect?: unknown,
=======
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		rect?: any,
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
		button: number = 0,
		device: string = "mouse",
		scopeId: number = 0,
	) {
		if (
<<<<<<< HEAD
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
=======
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			(this as any).sakuraPlayer?.timeCritical &&
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			(this as any).sakuraPlayer?.isPlaying
		)
			return;
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		const col = (this as any).getCollisionInfo(clientX, clientY, rect, scopeId);
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		(this as any).ghostController.sendShioriEvent("OnMouseUp", [
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
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
<<<<<<< HEAD
		rect?: unknown,
=======
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		rect?: any,
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
		delta: number = 0,
		scopeId: number = 0,
	) {
		if (
<<<<<<< HEAD
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
=======
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			(this as any).sakuraPlayer?.timeCritical &&
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			(this as any).sakuraPlayer?.isPlaying
		)
			return;
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		const col = (this as any).getCollisionInfo(clientX, clientY, rect, scopeId);
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		(this as any).ghostController.sendShioriEvent("OnMouseWheel", [
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
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
<<<<<<< HEAD
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
=======
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		rect?: any,
		scopeId: number = 0,
	) {
		if (
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			(this as any).sakuraPlayer?.timeCritical &&
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			(this as any).sakuraPlayer?.isPlaying
		)
			return;
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		const col = (this as any).getCollisionInfo(clientX, clientY, rect, scopeId);
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		(this as any).ghostController.sendShioriEvent("OnMouseDragStart", [
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
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
<<<<<<< HEAD
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
=======
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		rect?: any,
		scopeId: number = 0,
	) {
		if (
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			(this as any).sakuraPlayer?.timeCritical &&
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			(this as any).sakuraPlayer?.isPlaying
		)
			return;
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		const col = (this as any).getCollisionInfo(clientX, clientY, rect, scopeId);
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		(this as any).ghostController.sendShioriEvent("OnMouseDragEnd", [
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
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
<<<<<<< HEAD
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
=======
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		rect?: any,
		scopeId: number = 0,
	) {
		if (
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			(this as any).sakuraPlayer?.timeCritical &&
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			(this as any).sakuraPlayer?.isPlaying
		)
			return;
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		const col = (this as any).getCollisionInfo(clientX, clientY, rect, scopeId);
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		(this as any).ghostController.sendShioriEvent("OnMouseHover", [
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
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
<<<<<<< HEAD
		rect?: unknown,
=======
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		rect?: any,
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
		scopeId: number = 0,
	) {
		if (
			clientX !== undefined &&
			clientY !== undefined &&
			rect &&
<<<<<<< HEAD
			(this as unknown).surfaceManager
		) {
			return (this as unknown).surfaceManager.detectCollision(
=======
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			(this as any).surfaceManager
		) {
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			return (this as any).surfaceManager.detectCollision(
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
				clientX,
				clientY,
				rect,
				null,
				scopeId,
			);
		}
		return { name: "", canvasX: 0, canvasY: 0 };
	},

<<<<<<< HEAD
	detectPart(clientX?: number, clientY?: number, rect?: unknown) {
		return (this as unknown).getCollisionInfo(clientX, clientY, rect).name;
=======
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	detectPart(clientX?: number, clientY?: number, rect?: any) {
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		return (this as any).getCollisionInfo(clientX, clientY, rect).name;
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
	},
};
