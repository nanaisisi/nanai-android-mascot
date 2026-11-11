import { emit, invoke, isTauriAvailable, listen } from "../tauri-helper.js";

export const setupMethods = {
	async setupEventListeners() {
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
		const bind = (el: HTMLElement | null, scopeId: number) => {
			if (
				!el ||
				!(this as unknown as import("../../../main.js").NanaiAndroidMascotApp)
					.interactionManager
			)
				return;
			(
				this as unknown as import("../../../main.js").NanaiAndroidMascotApp
			).interactionManager.setupDragging(
				el,
				(x: number, y: number, rect: unknown) =>
					(
						this as unknown as import("../../../main.js").NanaiAndroidMascotApp
					).onGhostClick(x, y, rect, scopeId),
				(x: number, y: number, rect: unknown) =>
					(
						this as unknown as import("../../../main.js").NanaiAndroidMascotApp
					).onGhostStroke(x, y, rect, scopeId),
				{
					onGhostMouseDown: (
						x: number,
						y: number,
						rect: unknown,
						button: number,
						device: string,
					) =>
						(
							this as unknown as import("../../../main.js").NanaiAndroidMascotApp
						).onGhostMouseDown(x, y, rect, button, device, scopeId),
					onGhostMouseUp: (
						x: number,
						y: number,
						rect: unknown,
						button: number,
						device: string,
					) =>
						(
							this as unknown as import("../../../main.js").NanaiAndroidMascotApp
						).onGhostMouseUp(x, y, rect, button, device, scopeId),
					onGhostWheel: (x: number, y: number, rect: unknown, delta: number) =>
						(
							this as unknown as import("../../../main.js").NanaiAndroidMascotApp
						).onGhostWheel(x, y, rect, delta, scopeId),
					onGhostDragStart: (x: number, y: number, rect: unknown) =>
						(
							this as unknown as import("../../../main.js").NanaiAndroidMascotApp
						).onGhostDragStart(x, y, rect, scopeId),
					onGhostDragEnd: (x: number, y: number, rect: unknown) =>
						(
							this as unknown as import("../../../main.js").NanaiAndroidMascotApp
						).onGhostDragEnd(x, y, rect, scopeId),
					onGhostHover: (x: number, y: number, rect: unknown) =>
						(
							this as unknown as import("../../../main.js").NanaiAndroidMascotApp
						).onGhostHover(x, y, rect, scopeId),
				},
			);
			el.addEventListener("contextmenu", (e: MouseEvent) => {
				e.preventDefault();
				e.stopPropagation();
				(
					this as unknown as import("../../../main.js").NanaiAndroidMascotApp
				).toggleMenu(e.screenX, e.screenY, scopeId);
			});
		};
		bind(
			(this as unknown as import("../../../main.js").NanaiAndroidMascotApp)
				.elements?.ghostDisplay,
			0,
		);
		bind(
			(this as unknown as import("../../../main.js").NanaiAndroidMascotApp)
				.elements?.keroDisplay,
			1,
		);
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

		document.addEventListener("contextmenu", (e: MouseEvent) => {
			e.preventDefault();
			(
				this as unknown as import("../../../main.js").NanaiAndroidMascotApp
			).toggleMenu(e.screenX, e.screenY);
		});

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
		const forward = (event: unknown) => {
			const data = (
				event as { payload?: { action?: string; payload?: { scope?: number } } }
			)?.payload;
			if (!data) return;
			if (data.action === "request-sync") {
				const reqScope = data.payload?.scope ?? 0;
				(
					this as unknown as import("../../../main.js").NanaiAndroidMascotApp
				).syncMenuGhosts(reqScope);
				return;
			}
			if (data.action) {
				(
					this as unknown as import("../../../main.js").NanaiAndroidMascotApp
				).handleMenuAction(data.action, data.payload);
			}
		};
		await listen("menu-action", forward);
		await listen("native-menu-action", forward);

		await listen("request-subchar-image", (event: unknown) => {
			const scopeId = (event as { payload?: { scopeId?: number } })?.payload
				?.scopeId;
			if (typeof scopeId === "number") {
				const cachedSrc = (
					this as unknown as import("../../../main.js").NanaiAndroidMascotApp
				).ghostController?.currentSurfaces?.get(scopeId);
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
				(
					this as unknown as import("../../../main.js").NanaiAndroidMascotApp
				).syncMenuGhosts(reqScope);
				return;
			}
			(
				this as unknown as import("../../../main.js").NanaiAndroidMascotApp
			).hideMenu();
			(
				this as unknown as import("../../../main.js").NanaiAndroidMascotApp
			).handleMenuAction(action, event.data.payload);
		});
	},
};
