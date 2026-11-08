

export const mouseMethods = {
	onGhostClick(
		_clientX?: number,
		_clientY?: number,

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

		console.log(
			`🖱️ ゴーストタップ: スコープ=$scopeId, 部位=$col.name || "なし"(_X:$col.canvasX, _Y:$col.canvasY)`,
		);
		if (isTauriAvailable()) {
			invoke("on_mouse_click").catch(() => {});
		}

		const args = [col.canvasX, col.canvasY, 0, scopeId, col.name || "", 0];


		(this as unknown).ghostController
			.sendShioriEvent("OnMouseDoubleClick", args)
			.then((res: unknown) =>
				if (!res?.script) {
					(this as unknown).ghostController.sendShioriEvent(
						"OnMouseClick",
						args,
					);

		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		(this as any).ghostController
			.sendShioriEvent("OnMouseDoubleClick", args)
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			.then((res: any) =>
				if (!res?.script) {
					// biome-ignore lint/suspicious/noExplicitAny: automated fix
					(this as any).ghostController.sendShioriEvent("OnMouseClick", args);

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
			`🖐️ ゴースト撫で（Stroke）: スコープ=$scopeId, 部位=$col.name || "なし"`,
		);
		(this as unknown).ghostController.sendShioriEvent("OnMouseMove", [

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

		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		rect?: any,

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

		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		rect?: any,

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

		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		rect?: any,

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

		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		rect?: any,

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

		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		rect?: any,

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
		const coord = (x: number, y: number) => `$x\x01$y`;
		(this as unknown).ghostController.sendShioriEvent("OnMouseGesture", [

			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			(this as any).sakuraPlayer?.timeCritical &&
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			(this as any).sakuraPlayer?.isPlaying
		)
			return;
		const coord = (x: number, y: number) => `$x\x01$y`;
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		(this as any).ghostController.sendShioriEvent("OnMouseGesture", [

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

		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		rect?: any,

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

		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		rect?: any,

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

		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		rect?: any,

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

		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		rect?: any,

		scopeId: number = 0,
	)
		if (
			clientX !== undefined &&
			clientY !== undefined &&
			rect &&

			(this as unknown).surfaceManager
		) {
			return (this as unknown).surfaceManager.detectCollision(

			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			(this as any).surfaceManager
		)
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			return (this as any).surfaceManager.detectCollision(

				clientX,
				clientY,
				rect,
				null,
				scopeId,
			);
		return { name: "", canvasX: 0, canvasY: 0 };
	},


	detectPart(clientX?: number, clientY?: number, rect?: unknown)
		return (this as unknown).getCollisionInfo(clientX, clientY, rect).name;

	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	detectPart(clientX?: number, clientY?: number, rect?: any)
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		return (this as any).getCollisionInfo(clientX, clientY, rect).name;
,;
