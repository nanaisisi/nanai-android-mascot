import { emit, invoke, isTauriAvailable, listen } from "./tauri-helper.js";

export const eventMethods = {
	setupEventListeners() {
		(this as any).setupGhostInteractions();
		(this as any).setupUiButtons();
		(this as any).setupGlobalListeners();
		(this as any).setupExternalMenuListeners();
	},

	setupGhostInteractions() {
		const bind = (el: HTMLElement | null, scopeId: number) => {
			if (!el) return;
			(this as any).interactionManager.setupDragging(
				el,
				(x: number, y: number, rect: any) => (this as any).onGhostClick(x, y, rect, scopeId),
				(x: number, y: number, rect: any) => (this as any).onGhostStroke(x, y, rect, scopeId),
				{
					onGhostMouseDown: (x: number, y: number, rect: any, button: number, device: string) =>
						(this as any).onGhostMouseDown(x, y, rect, button, device, scopeId),
					onGhostMouseUp: (x: number, y: number, rect: any, button: number, device: string) =>
						(this as any).onGhostMouseUp(x, y, rect, button, device, scopeId),
					onGhostWheel: (x: number, y: number, rect: any, delta: number) =>
						(this as any).onGhostWheel(x, y, rect, delta, scopeId),
					onGhostDragStart: (x: number, y: number, rect: any) =>
						(this as any).onGhostDragStart(x, y, rect, scopeId),
					onGhostDragEnd: (x: number, y: number, rect: any) =>
						(this as any).onGhostDragEnd(x, y, rect, scopeId),
					onGhostHover: (x: number, y: number, rect: any) => (this as any).onGhostHover(x, y, rect, scopeId),
				},
			);
			el.addEventListener("contextmenu", (e: MouseEvent) => {
				e.preventDefault();
				e.stopPropagation();
				(this as any).toggleMenu(e.screenX, e.screenY, scopeId);
			});
		};
		bind((this as any).elements.ghostDisplay, 0);
		bind((this as any).elements.keroDisplay, 1);
	},

	setupUiButtons() {
		(this as any).elements.menuBtn?.addEventListener("click", (e: MouseEvent) => {
			e.stopPropagation();
			const rect = (this as any).elements.menuBtn.getBoundingClientRect();
			const sX = (globalThis as any).screenX ?? 0;
			const sY = (globalThis as any).screenY ?? 0;
			(this as any).toggleMenu(
				e.screenX || sX + rect.right,
				e.screenY || sY + rect.bottom,
			);
		});

		(this as any).elements.quickBubble?.addEventListener("click", (e: MouseEvent) => {
			e.stopPropagation();
			(this as any).toggleQuickActionsPanel();
		});

		const quick: Record<string, () => void> = {
			"qa-talk-btn": () => (this as any).onGhostClick(),
			"qa-ghost-btn": () => (this as any).switchToNextGhost(),
			"qa-balloon-btn": () => (this as any).handleMenuAction("balloon"),
			"qa-minimize-btn": () => (this as any).handleMenuAction("minimize"),
		};
		for (const [id, fn] of Object.entries(quick)) {
			document.getElementById(id)?.addEventListener("click", (e: MouseEvent) => {
				e.stopPropagation();
				(this as any).hideQuickActionsPanel();
				fn();
			});
		}

		(this as any).elements.balloonDisplay?.addEventListener("click", () =>
			(this as any).sakuraPlayer.skip(),
		);
	},

	setupGlobalListeners() {
		document.addEventListener("click", () => {
			(this as any).hideMenu();
			(this as any).hideQuickActionsPanel();
		});

		document.addEventListener("contextmenu", (e: MouseEvent) => {
			e.preventDefault();
			(this as any).toggleMenu(e.screenX, e.screenY);
		});

		document.addEventListener("keydown", (e: KeyboardEvent) => {
			const key = e.key.toLowerCase();
			if (e.key === "Escape") {
				(this as any).modalManager?.hide();
				(this as any).hideMenu();
			} else if ((e.ctrlKey || e.metaKey) && (key === "w" || key === "q")) {
				e.preventDefault();
				(this as any).closeApp();
			}
		});
	},

	setupExternalMenuListeners() {
		const forward = (event: any) => {
			const data = event.payload;
			if (!data) return;
			if (data.action === "request-sync") {
				const reqScope = data.payload?.scope ?? 0;
				(this as any).syncMenuGhosts(reqScope);
				return;
			}
			(this as any).handleMenuAction(data.action, data.payload);
		};
		listen("menu-action", forward);
		listen("native-menu-action", forward);

		listen("request-subchar-image", (event: any) => {
			const scopeId = event.payload?.scopeId;
			if (typeof scopeId === "number") {
				const cachedSrc = (this as any).ghostController?.currentSurfaces?.get(scopeId);
				if (cachedSrc) {
					emit(`update-subchar-image-${scopeId}`, { src: cachedSrc });
				}
			}
		});

		globalThis.addEventListener("message", (event: MessageEvent) => {
			if (event.data?.type !== "menu-action") return;
			const action = event.data.action;
			if (action === "request-sync") {
				const reqScope = event.data.payload?.scope ?? 0;
				(this as any).syncMenuGhosts(reqScope);
				return;
			}
			(this as any).hideMenu();
			(this as any).handleMenuAction(action, event.data.payload);
		});
	},

	onGhostClick(clientX?: number, clientY?: number, rect?: any, scopeId: number = 0) {
		if ((this as any).sakuraPlayer?.timeCritical && (this as any).sakuraPlayer?.isPlaying) return;
		const col = (this as any).getCollisionInfo(clientX, clientY, rect, scopeId);
		console.log(
			`🖱️ ゴーストタップ: スコープ=${scopeId}, 部位=${col.name || "なし"} (X:${col.canvasX}, Y:${col.canvasY})`,
		);
		if (isTauriAvailable()) {
			invoke("on_mouse_click").catch(() => {});
		}

		const args = [col.canvasX, col.canvasY, 0, scopeId, col.name || "", 0];

		(this as any).ghostController
			.sendShioriEvent("OnMouseDoubleClick", args)
			.then((res: any) => {
				if (!res?.script) {
					(this as any).ghostController.sendShioriEvent("OnMouseClick", args);
				}
			});
	},

	onGhostStroke(clientX?: number, clientY?: number, rect?: any, scopeId: number = 0) {
		if ((this as any).sakuraPlayer?.timeCritical && (this as any).sakuraPlayer?.isPlaying) return;
		const col = (this as any).getCollisionInfo(clientX, clientY, rect, scopeId);
		console.log(
			`🖐️ ゴースト撫で（Stroke）: スコープ=${scopeId}, 部位=${col.name || "なし"}`,
		);
		(this as any).ghostController.sendShioriEvent("OnMouseMove", [
			col.canvasX,
			col.canvasY,
			0,
			scopeId,
			col.name || "",
		]);
	},

	onGhostMouseEnter(clientX?: number, clientY?: number, rect?: any, scopeId: number = 0, isWindow: boolean = false) {
		if ((this as any).sakuraPlayer?.timeCritical && (this as any).sakuraPlayer?.isPlaying) return;
		const col = (this as any).getCollisionInfo(clientX, clientY, rect, scopeId);
		const eventName = isWindow ? "OnMouseEnterAll" : "OnMouseEnter";
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

	onGhostMouseLeave(clientX?: number, clientY?: number, rect?: any, scopeId: number = 0, isWindow: boolean = false) {
		if ((this as any).sakuraPlayer?.timeCritical && (this as any).sakuraPlayer?.isPlaying) return;
		const col = (this as any).getCollisionInfo(clientX, clientY, rect, scopeId);
		const eventName = isWindow ? "OnMouseLeaveAll" : "OnMouseLeave";
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
		rect?: any,
		button: string | number = "middle",
		device: string = "mouse",
		scopeId: number = 0,
	) {
		if ((this as any).sakuraPlayer?.timeCritical && (this as any).sakuraPlayer?.isPlaying) return;
		const col = (this as any).getCollisionInfo(clientX, clientY, rect, scopeId);
		const eventName = type === "up" ? "OnMouseUpEx" : "OnMouseDownEx";
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
		rect?: any,
		button: string | number = "middle",
		device: string = "mouse",
		scopeId: number = 0,
		isDouble: boolean = false,
	) {
		if ((this as any).sakuraPlayer?.timeCritical && (this as any).sakuraPlayer?.isPlaying) return;
		const col = (this as any).getCollisionInfo(clientX, clientY, rect, scopeId);
		const eventName = isDouble ? "OnMouseDoubleClickEx" : "OnMouseClickEx";
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
		rect?: any,
		count: number = 3,
		button: number = 0,
		device: string = "mouse",
		scopeId: number = 0,
		isEx: boolean = false,
	) {
		if ((this as any).sakuraPlayer?.timeCritical && (this as any).sakuraPlayer?.isPlaying) return;
		const col = (this as any).getCollisionInfo(clientX, clientY, rect, scopeId);
		const eventName = isEx ? "OnMouseMultipleClickEx" : "OnMouseMultipleClick";
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
		if ((this as any).sakuraPlayer?.timeCritical && (this as any).sakuraPlayer?.isPlaying) return;
		const coord = (x: number, y: number) => `${x}\x01${y}`;
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
		rect?: any,
		button: number = 0,
		device: string = "mouse",
		scopeId: number = 0,
	) {
		if ((this as any).sakuraPlayer?.timeCritical && (this as any).sakuraPlayer?.isPlaying) return;
		const col = (this as any).getCollisionInfo(clientX, clientY, rect, scopeId);
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
		rect?: any,
		button: number = 0,
		device: string = "mouse",
		scopeId: number = 0,
	) {
		if ((this as any).sakuraPlayer?.timeCritical && (this as any).sakuraPlayer?.isPlaying) return;
		const col = (this as any).getCollisionInfo(clientX, clientY, rect, scopeId);
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

	onGhostWheel(clientX?: number, clientY?: number, rect?: any, delta: number = 0, scopeId: number = 0) {
		if ((this as any).sakuraPlayer?.timeCritical && (this as any).sakuraPlayer?.isPlaying) return;
		const col = (this as any).getCollisionInfo(clientX, clientY, rect, scopeId);
		(this as any).ghostController.sendShioriEvent("OnMouseWheel", [
			col.canvasX,
			col.canvasY,
			delta,
			scopeId,
			col.name || "",
		]);
	},

	onGhostDragStart(clientX?: number, clientY?: number, rect?: any, scopeId: number = 0) {
		if ((this as any).sakuraPlayer?.timeCritical && (this as any).sakuraPlayer?.isPlaying) return;
		const col = (this as any).getCollisionInfo(clientX, clientY, rect, scopeId);
		(this as any).ghostController.sendShioriEvent("OnMouseDragStart", [
			col.canvasX,
			col.canvasY,
			0,
			scopeId,
			col.name || "",
		]);
	},

	onGhostDragEnd(clientX?: number, clientY?: number, rect?: any, scopeId: number = 0) {
		if ((this as any).sakuraPlayer?.timeCritical && (this as any).sakuraPlayer?.isPlaying) return;
		const col = (this as any).getCollisionInfo(clientX, clientY, rect, scopeId);
		(this as any).ghostController.sendShioriEvent("OnMouseDragEnd", [
			col.canvasX,
			col.canvasY,
			0,
			scopeId,
			col.name || "",
		]);
	},

	onGhostHover(clientX?: number, clientY?: number, rect?: any, scopeId: number = 0) {
		if ((this as any).sakuraPlayer?.timeCritical && (this as any).sakuraPlayer?.isPlaying) return;
		const col = (this as any).getCollisionInfo(clientX, clientY, rect, scopeId);
		(this as any).ghostController.sendShioriEvent("OnMouseHover", [
			col.canvasX,
			col.canvasY,
			0,
			scopeId,
			col.name || "",
		]);
	},

	getCollisionInfo(clientX?: number, clientY?: number, rect?: any, scopeId: number = 0) {
		if (
			clientX !== undefined &&
			clientY !== undefined &&
			rect &&
			(this as any).surfaceManager
		) {
			return (this as any).surfaceManager.detectCollision(
				clientX,
				clientY,
				rect,
				null,
				scopeId,
			);
		}
		return { name: "", canvasX: 0, canvasY: 0 };
	},

	detectPart(clientX?: number, clientY?: number, rect?: any) {
		return (this as any).getCollisionInfo(clientX, clientY, rect).name;
	},
};
