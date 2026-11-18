import { showBalloonContextMenu } from "../../ui/balloon-context-menu.js";
import {
	emit,
	frontendLog,
	invoke,
	isTauriAvailable,
	listen,
} from "../tauri-helper.js";
import {
	clearPartTracking,
	resetPartTracking,
	trackPartTransition,
} from "./mouse/hover.js";

type SetupAppContext = import("../../../main.js").NanaiAndroidMascotApp & {
	onGhostClick: (
		x?: number,
		y?: number,
		rect?: unknown,
		scopeId?: number,
		clickType?: "single" | "double",
	) => unknown;
	onGhostMouseEnter?: (
		x?: number,
		y?: number,
		rect?: unknown,
		scopeId?: number,
		isWindow?: boolean,
	) => unknown;
	onGhostMouseLeave?: (
		x?: number,
		y?: number,
		rect?: unknown,
		scopeId?: number,
		isWindow?: boolean,
	) => unknown;
	onGhostMouseEx?: (
		type: string,
		x?: number,
		y?: number,
		rect?: unknown,
		button?: string | number,
		device?: string,
		scopeId?: number,
	) => unknown;
	onGhostMouseClickEx?: (
		x?: number,
		y?: number,
		rect?: unknown,
		button?: string | number,
		device?: string,
		scopeId?: number,
		isDouble?: boolean,
	) => unknown;
	onGhostMultipleClick?: (
		x?: number,
		y?: number,
		rect?: unknown,
		count?: number,
		button?: number | string,
		device?: string,
		scopeId?: number,
		isEx?: boolean,
	) => unknown;
	onGhostGesture?: (
		startX: number,
		startY: number,
		startPart: string,
		endX: number,
		endY: number,
		endPart: string,
		direction: string,
		scopeId?: number,
	) => unknown;
	getCollisionInfo?: (
		x?: number,
		y?: number,
		rect?: unknown,
		scopeId?: number,
	) => { name?: string; canvasX?: number; canvasY?: number; scopeId?: number };
};

interface GhostMouseEventPayload {
	type?: string;
	scopeId?: number;
	clientX?: number;
	clientY?: number;
	rect?: unknown;
	count?: number;
	button?: number | string;
	device?: string;
	isEx?: boolean;
	isDouble?: boolean;
	delta?: number;
	isWindow?: boolean;
	startX?: number;
	startY?: number;
	endX?: number;
	endY?: number;
	direction?: string;
}

function dispatchGestureWithCollision(
	app: SetupAppContext,
	startX: number | undefined,
	startY: number | undefined,
	endX: number | undefined,
	endY: number | undefined,
	direction: string,
	rect: unknown,
	scopeId: number,
) {
	const startCol = app.getCollisionInfo?.(startX, startY, rect, scopeId);
	const endCol = app.getCollisionInfo?.(endX, endY, rect, scopeId);
	app.onGhostGesture?.(
		startCol?.canvasX ?? startX ?? 0,
		startCol?.canvasY ?? startY ?? 0,
		startCol?.name || "",
		endCol?.canvasX ?? endX ?? 0,
		endCol?.canvasY ?? endY ?? 0,
		endCol?.name || "",
		direction,
		scopeId,
	);
}

export const setupMethods = {
	async setupEventListeners() {
		if (
			(this as unknown as { _eventListenersSet?: boolean })._eventListenersSet
		) {
			return;
		}
		(this as unknown as { _eventListenersSet?: boolean })._eventListenersSet =
			true;

		(
			this as unknown as import("../../../main.js").NanaiAndroidMascotApp
		).setupGhostInteractions();
		(
			this as unknown as import("../../../main.js").NanaiAndroidMascotApp
		).setupUiButtons();
		(
			this as unknown as import("../../../main.js").NanaiAndroidMascotApp
		).setupGlobalListeners();
		await (
			this as unknown as import("../../../main.js").NanaiAndroidMascotApp
		).setupExternalMenuListeners();
	},

	setupGhostInteractions() {
		const app = this as unknown as SetupAppContext;
		const bind = (el: HTMLElement | null, scopeId: number) => {
			if (!el || !app.interactionManager) return;
			app.interactionManager.setupDragging(
				el,
				(
					x: number,
					y: number,
					rect: unknown,
					clickType?: "single" | "double",
				) => app.onGhostClick(x, y, rect, scopeId, clickType),
				(x: number, y: number, rect: unknown) => {
					void trackPartTransition(app, x, y, rect, scopeId);
					return app.onGhostStroke(x, y, rect, scopeId);
				},
				{
					onGhostMouseDown: (
						x: number,
						y: number,
						rect: unknown,
						button: number,
						device: string,
					) => app.onGhostMouseDown(x, y, rect, button, device, scopeId),
					onGhostMouseUp: (
						x: number,
						y: number,
						rect: unknown,
						button: number,
						device: string,
					) => app.onGhostMouseUp(x, y, rect, button, device, scopeId),
					onGhostMouseEx: (
						type: string,
						x: number,
						y: number,
						rect: unknown,
						button: string | number,
						device: string,
					) => app.onGhostMouseEx?.(type, x, y, rect, button, device, scopeId),
					onGhostMouseClickEx: (
						x: number,
						y: number,
						rect: unknown,
						button: string | number,
						device: string,
						isDouble: boolean,
					) =>
						app.onGhostMouseClickEx?.(
							x,
							y,
							rect,
							button,
							device,
							scopeId,
							isDouble,
						),
					onGhostMultipleClick: (
						x: number,
						y: number,
						rect: unknown,
						count: number,
						button: number | string,
						device: string,
						isEx: boolean,
					) =>
						app.onGhostMultipleClick?.(
							x,
							y,
							rect,
							count,
							button,
							device,
							scopeId,
							isEx,
						),
					onGhostWheel: (x: number, y: number, rect: unknown, delta: number) =>
						app.onGhostWheel(x, y, rect, delta, scopeId),
					onGhostDragStart: (x: number, y: number, rect: unknown) =>
						app.onGhostDragStart(x, y, rect, scopeId),
					onGhostDragEnd: (x: number, y: number, rect: unknown) =>
						app.onGhostDragEnd(x, y, rect, scopeId),
					onGhostHover: (x: number, y: number, rect: unknown) => {
						void trackPartTransition(app, x, y, rect, scopeId);
						return app.onGhostHover(x, y, rect, scopeId);
					},
					onGhostMouseEnter: (
						x: number,
						y: number,
						rect: unknown,
						isWindow?: boolean,
					) => app.onGhostMouseEnter?.(x, y, rect, scopeId, isWindow),
					onGhostMouseLeave: (
						x: number,
						y: number,
						rect: unknown,
						isWindow?: boolean,
					) => {
						if (isWindow) {
							void resetPartTracking(app, scopeId, x, y, rect);
						} else {
							clearPartTracking(app, scopeId);
						}
						return app.onGhostMouseLeave?.(x, y, rect, scopeId, isWindow);
					},
					onGhostGesture: (
						startX: number,
						startY: number,
						endX: number,
						endY: number,
						direction: string,
						rect: unknown,
					) =>
						dispatchGestureWithCollision(
							app,
							startX,
							startY,
							endX,
							endY,
							direction,
							rect,
							scopeId,
						),
				},
			);
			el.addEventListener("contextmenu", (e: MouseEvent) => {
				e.preventDefault();
				e.stopPropagation();
				app.toggleMenu(e.screenX, e.screenY, scopeId);
			});
		};
		bind(app.elements?.ghostDisplay, 0);
		bind(app.elements?.keroDisplay, 1);

		const bindBalloon = (
			el: HTMLElement | null | undefined,
			scopeId: number,
		) => {
			if (!el) return;
			const handler = (e: MouseEvent) => {
				e.preventDefault();
				e.stopPropagation();
				const posX = e.clientX || e.pageX || 100;
				const posY = e.clientY || e.pageY || 100;
				showBalloonContextMenu({
					x: posX,
					y: posY,
					scopeId,
					app: this,
				});
				return false;
			};
			el.addEventListener("contextmenu", handler as EventListener, true);
		};

		bindBalloon(
			(this as unknown as import("../../../main.js").NanaiAndroidMascotApp)
				.elements?.balloonDisplay ||
				(typeof document !== "undefined"
					? document.getElementById("balloon-display")
					: null),
			0,
		);
		bindBalloon(
			(this as unknown as import("../../../main.js").NanaiAndroidMascotApp)
				.elements?.keroBalloonDisplay ||
				(typeof document !== "undefined"
					? document.getElementById("kero-balloon-display")
					: null),
			1,
		);

		if (
			typeof document !== "undefined" &&
			typeof document.querySelectorAll === "function"
		) {
			document.querySelectorAll(".balloon-display").forEach((el, idx) => {
				bindBalloon(el as HTMLElement, idx);
			});
		}
	},

	setupUiButtons() {
		(
			this as unknown as import("../../../main.js").NanaiAndroidMascotApp
		).elements?.menuBtn?.addEventListener("click", (e: MouseEvent) => {
			e.stopPropagation();
			const menuBtn = (
				this as unknown as import("../../../main.js").NanaiAndroidMascotApp
			).elements?.menuBtn;
			if (!menuBtn) return;
			const rect = menuBtn.getBoundingClientRect();
			const sX = (globalThis as unknown as { screenX?: number }).screenX ?? 0;
			const sY = (globalThis as unknown as { screenY?: number }).screenY ?? 0;
			(
				this as unknown as import("../../../main.js").NanaiAndroidMascotApp
			).toggleMenu(e.screenX || sX + rect.right, e.screenY || sY + rect.bottom);
		});

		(
			this as unknown as import("../../../main.js").NanaiAndroidMascotApp
		).elements?.quickBubble?.addEventListener("click", (e: MouseEvent) => {
			e.stopPropagation();
			(
				this as unknown as import("../../../main.js").NanaiAndroidMascotApp
			).toggleQuickActionsPanel();
		});

		const quick: Record<string, () => void> = {
			"qa-talk-btn": () =>
				(
					this as unknown as import("../../../main.js").NanaiAndroidMascotApp
				).onGhostClick(),
			"qa-ghost-btn": () =>
				(
					this as unknown as import("../../../main.js").NanaiAndroidMascotApp
				).switchToNextGhost(),
			"qa-balloon-btn": () =>
				(
					this as unknown as import("../../../main.js").NanaiAndroidMascotApp
				).handleMenuAction("balloon"),
			"qa-minimize-btn": () =>
				(
					this as unknown as import("../../../main.js").NanaiAndroidMascotApp
				).handleMenuAction("minimize"),
		};
		for (const [id, fn] of Object.entries(quick)) {
			document
				.getElementById(id)
				?.addEventListener("click", (e: MouseEvent) => {
					e.stopPropagation();
					(
						this as unknown as import("../../../main.js").NanaiAndroidMascotApp
					).hideQuickActionsPanel();
					fn();
				});
		}

		(
			this as unknown as import("../../../main.js").NanaiAndroidMascotApp
		).elements?.balloonDisplay?.addEventListener("click", () =>
			(
				this as unknown as import("../../../main.js").NanaiAndroidMascotApp
			).sakuraPlayer?.skip(),
		);
	},

	setupGlobalListeners() {
		document.addEventListener("click", () => {
			(
				this as unknown as import("../../../main.js").NanaiAndroidMascotApp
			).hideMenu();
			(
				this as unknown as import("../../../main.js").NanaiAndroidMascotApp
			).hideQuickActionsPanel();
		});

		const globalContextMenuHandler = (e: MouseEvent) => {
			const target = e.target as HTMLElement | null;
			const isInput =
				target &&
				(target.tagName === "INPUT" ||
					target.tagName === "TEXTAREA" ||
					target.isContentEditable);
			if (!isInput) {
				e.preventDefault?.();
				e.stopPropagation?.();
			}

			const isBalloonClick = Boolean(
				target?.closest?.(
					".balloon-display, .balloon, .balloon-text, .kero-balloon, [id*='balloon'], [class*='balloon']",
				),
			);

			const posX = e.clientX || e.pageX || 100;
			const posY = e.clientY || e.pageY || 100;
			const sX = e.screenX || posX;
			const sY = e.screenY || posY;

			console.log(
				`🖱️ [ContextMenu Event] 右クリック検知: isBalloon=${isBalloonClick}, target=${target?.tagName}#${target?.id}.${target?.className}, posX=${posX}, posY=${posY}`,
			);
			frontendLog(
				`🖱️ [ContextMenu Event] 右クリック検知: isBalloon=${isBalloonClick}, target=${target?.tagName}#${target?.id}.${target?.className}, posX=${posX}, posY=${posY}`,
			);

			if (isBalloonClick) {
				const scopeId = target?.closest?.(
					"#kero-balloon-display, .kero-balloon, .char-balloon-1",
				)
					? 1
					: 0;

				void showBalloonContextMenu({
					x: posX,
					y: posY,
					screenX: sX,
					screenY: sY,
					scopeId,
					app: this,
				});
				return false;
			}
			if (!isInput) {
				(
					this as unknown as import("../../../main.js").NanaiAndroidMascotApp
				).toggleMenu(sX, sY);
			}
			return false;
		};

		document.addEventListener("contextmenu", globalContextMenuHandler, true);
		if (typeof window !== "undefined") {
			window.addEventListener("contextmenu", globalContextMenuHandler, true);
			try {
				(window as unknown as { oncontextmenu?: unknown }).oncontextmenu =
					globalContextMenuHandler;
			} catch (_) {}
		}
		try {
			(document as unknown as { oncontextmenu?: unknown }).oncontextmenu =
				globalContextMenuHandler;
		} catch (_) {}

		document.addEventListener("keydown", (e: KeyboardEvent) => {
			const key = e.key.toLowerCase();
			if (e.key === "Escape") {
				(
					this as unknown as import("../../../main.js").NanaiAndroidMascotApp
				).modalManager?.hide();
				(
					this as unknown as import("../../../main.js").NanaiAndroidMascotApp
				).hideMenu();
			} else if ((e.ctrlKey || e.metaKey) && (key === "w" || key === "q")) {
				e.preventDefault();
				(
					this as unknown as import("../../../main.js").NanaiAndroidMascotApp
				).closeApp();
			} else if (
				e.ctrlKey &&
				e.shiftKey &&
				(e.key === "F10" || key === "f10")
			) {
				e.preventDefault();
				if (isTauriAvailable()) {
					void invoke("reset_balloon_positions").catch(() => {});
				}
			}
		});
	},

	async setupExternalMenuListeners() {
		const app = this as unknown as SetupAppContext;
		const forward = (event: unknown) => {
			const data = (
				event as { payload?: { action?: string; payload?: { scope?: number } } }
			)?.payload;
			if (!data) return;
			if (data.action === "request-sync") {
				const reqScope = data.payload?.scope ?? 0;
				app.syncMenuGhosts(reqScope);
				return;
			}
			if (data.action) {
				app.handleMenuAction(data.action, data.payload);
			}
		};
		await listen("menu-action", forward);
		await listen("native-menu-action", forward);

		await listen("request-subchar-image", (event: unknown) => {
			const scopeId = (event as { payload?: { scopeId?: number } })?.payload
				?.scopeId;
			if (typeof scopeId === "number") {
				const cachedSrc = app.ghostController?.currentSurfaces?.get(scopeId);
				if (cachedSrc) {
					emit(`update-subchar-image-${scopeId}`, { src: cachedSrc });
				}
			}
		});

		await listen("ghost-mouse-event", (event: unknown) => {
			const p = (
				event as { payload?: GhostMouseEventPayload } | null | undefined
			)?.payload;
			if (!p?.type) return;
			const scopeId = p.scopeId ?? 0;

			switch (p.type) {
				case "click":
					app.onGhostClick?.(p.clientX, p.clientY, p.rect, scopeId, "single");
					break;
				case "dblclick":
					app.onGhostClick?.(p.clientX, p.clientY, p.rect, scopeId, "double");
					break;
				case "multipleclick":
					app.onGhostMultipleClick?.(
						p.clientX,
						p.clientY,
						p.rect,
						p.count ?? 3,
						p.button ?? 0,
						p.device ?? "mouse",
						scopeId,
						Boolean(p.isEx),
					);
					break;
				case "mousemove":
					void trackPartTransition(app, p.clientX, p.clientY, p.rect, scopeId);
					break;
				case "stroke":
					void trackPartTransition(app, p.clientX, p.clientY, p.rect, scopeId);
					app.onGhostStroke?.(p.clientX, p.clientY, p.rect, scopeId);
					break;
				case "mousedown":
					app.onGhostMouseDown?.(
						p.clientX,
						p.clientY,
						p.rect,
						(p.button ?? 0) as number,
						p.device ?? "mouse",
						scopeId,
					);
					break;
				case "mouseup":
					app.onGhostMouseUp?.(
						p.clientX,
						p.clientY,
						p.rect,
						(p.button ?? 0) as number,
						p.device ?? "mouse",
						scopeId,
					);
					break;
				case "mousedown-ex":
					app.onGhostMouseEx?.(
						"down",
						p.clientX,
						p.clientY,
						p.rect,
						p.button ?? "middle",
						p.device ?? "mouse",
						scopeId,
					);
					break;
				case "mouseup-ex":
					app.onGhostMouseEx?.(
						"up",
						p.clientX,
						p.clientY,
						p.rect,
						p.button ?? "middle",
						p.device ?? "mouse",
						scopeId,
					);
					break;
				case "click-ex":
					app.onGhostMouseClickEx?.(
						p.clientX,
						p.clientY,
						p.rect,
						p.button ?? "middle",
						p.device ?? "mouse",
						scopeId,
						Boolean(p.isDouble),
					);
					break;
				case "wheel":
					app.onGhostWheel?.(
						p.clientX,
						p.clientY,
						p.rect,
						p.delta ?? 0,
						scopeId,
					);
					break;
				case "dragstart":
					app.onGhostDragStart?.(p.clientX, p.clientY, p.rect, scopeId);
					break;
				case "dragend":
					app.onGhostDragEnd?.(p.clientX, p.clientY, p.rect, scopeId);
					break;
				case "hover":
					void trackPartTransition(app, p.clientX, p.clientY, p.rect, scopeId);
					app.onGhostHover?.(p.clientX, p.clientY, p.rect, scopeId);
					break;
				case "mouseenter":
					app.onGhostMouseEnter?.(
						p.clientX,
						p.clientY,
						p.rect,
						scopeId,
						Boolean(p.isWindow ?? true),
					);
					break;
				case "mouseleave":
					void resetPartTracking(app, scopeId, p.clientX, p.clientY, p.rect);
					app.onGhostMouseLeave?.(
						p.clientX,
						p.clientY,
						p.rect,
						scopeId,
						Boolean(p.isWindow ?? true),
					);
					break;
				case "gesture":
					dispatchGestureWithCollision(
						app,
						p.startX,
						p.startY,
						p.endX,
						p.endY,
						p.direction || "",
						p.rect,
						scopeId,
					);
					break;
			}
		});

		globalThis.addEventListener("message", (event: MessageEvent) => {
			if (event.data?.type !== "menu-action") return;
			const action = event.data.action;
			if (action === "request-sync") {
				const reqScope = event.data.payload?.scope ?? 0;
				app.syncMenuGhosts(reqScope);
				return;
			}
			app.hideMenu();
			app.handleMenuAction(action, event.data.payload);
		});
	},
};
