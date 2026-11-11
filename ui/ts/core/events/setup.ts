import { emit, invoke, isTauriAvailable, listen } from "../tauri-helper.js";

export const setupMethods = {
	async setupEventListeners() {
		(
			this as import("../../../main.js").NanaiAndroidMascotApp
		).setupGhostInteractions();
		(this as import("../../../main.js").NanaiAndroidMascotApp).setupUiButtons();
		(
			this as import("../../../main.js").NanaiAndroidMascotApp
		).setupGlobalListeners();
		await (
			this as import("../../../main.js").NanaiAndroidMascotApp
		).setupExternalMenuListeners();
	},

	setupGhostInteractions() {
		const bind = (el: HTMLElement | null, scopeId: number) => {
			if (
				!el ||
				!(this as import("../../../main.js").NanaiAndroidMascotApp)
					.interactionManager
			)
				return;
			(
				this as import("../../../main.js").NanaiAndroidMascotApp
			).interactionManager.setupDragging(
				el,
				(x: number, y: number, rect: unknown) =>
					(
						this as import("../../../main.js").NanaiAndroidMascotApp
					).onGhostClick(x, y, rect, scopeId),
				(x: number, y: number, rect: unknown) =>
					(
						this as import("../../../main.js").NanaiAndroidMascotApp
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
							this as import("../../../main.js").NanaiAndroidMascotApp
						).onGhostMouseDown(x, y, rect, button, device, scopeId),
					onGhostMouseUp: (
						x: number,
						y: number,
						rect: unknown,
						button: number,
						device: string,
					) =>
						(
							this as import("../../../main.js").NanaiAndroidMascotApp
						).onGhostMouseUp(x, y, rect, button, device, scopeId),
					onGhostWheel: (x: number, y: number, rect: unknown, delta: number) =>
						(
							this as import("../../../main.js").NanaiAndroidMascotApp
						).onGhostWheel(x, y, rect, delta, scopeId),
					onGhostDragStart: (x: number, y: number, rect: unknown) =>
						(
							this as import("../../../main.js").NanaiAndroidMascotApp
						).onGhostDragStart(x, y, rect, scopeId),
					onGhostDragEnd: (x: number, y: number, rect: unknown) =>
						(
							this as import("../../../main.js").NanaiAndroidMascotApp
						).onGhostDragEnd(x, y, rect, scopeId),
					onGhostHover: (x: number, y: number, rect: unknown) =>
						(
							this as import("../../../main.js").NanaiAndroidMascotApp
						).onGhostHover(x, y, rect, scopeId),
				},
			);
			el.addEventListener("contextmenu", (e: MouseEvent) => {
				e.preventDefault();
				e.stopPropagation();
				(this as import("../../../main.js").NanaiAndroidMascotApp).toggleMenu(
					e.screenX,
					e.screenY,
					scopeId,
				);
			});
		};
		bind(
			(this as import("../../../main.js").NanaiAndroidMascotApp).elements
				?.ghostDisplay,
			0,
		);
		bind(
			(this as import("../../../main.js").NanaiAndroidMascotApp).elements
				?.keroDisplay,
			1,
		);
	},

	setupUiButtons() {
		(
			this as import("../../../main.js").NanaiAndroidMascotApp
		).elements?.menuBtn?.addEventListener("click", (e: MouseEvent) => {
			e.stopPropagation();
			const rect = (
				this as import("../../../main.js").NanaiAndroidMascotApp
			).elements.menuBtn.getBoundingClientRect();
			const sX = (globalThis as unknown).screenX ?? 0;
			const sY = (globalThis as unknown).screenY ?? 0;
			(this as import("../../../main.js").NanaiAndroidMascotApp).toggleMenu(
				e.screenX || sX + rect.right,
				e.screenY || sY + rect.bottom,
			);
		});

		(
			this as import("../../../main.js").NanaiAndroidMascotApp
		).elements?.quickBubble?.addEventListener("click", (e: MouseEvent) => {
			e.stopPropagation();
			(
				this as import("../../../main.js").NanaiAndroidMascotApp
			).toggleQuickActionsPanel();
		});

		const quick: Record<string, () => void> = {
			"qa-talk-btn": () =>
				(
					this as import("../../../main.js").NanaiAndroidMascotApp
				).onGhostClick(),
			"qa-ghost-btn": () =>
				(
					this as import("../../../main.js").NanaiAndroidMascotApp
				).switchToNextGhost(),
			"qa-balloon-btn": () =>
				(
					this as import("../../../main.js").NanaiAndroidMascotApp
				).handleMenuAction("balloon"),
			"qa-minimize-btn": () =>
				(
					this as import("../../../main.js").NanaiAndroidMascotApp
				).handleMenuAction("minimize"),
		};
		for (const [id, fn] of Object.entries(quick)) {
			document
				.getElementById(id)
				?.addEventListener("click", (e: MouseEvent) => {
					e.stopPropagation();
					(
						this as import("../../../main.js").NanaiAndroidMascotApp
					).hideQuickActionsPanel();
					fn();
				});
		}

		(
			this as import("../../../main.js").NanaiAndroidMascotApp
		).elements?.balloonDisplay?.addEventListener("click", () =>
			(
				this as import("../../../main.js").NanaiAndroidMascotApp
			).sakuraPlayer?.skip(),
		);
	},

	setupGlobalListeners() {
		document.addEventListener("click", () => {
			(this as import("../../../main.js").NanaiAndroidMascotApp).hideMenu();
			(
				this as import("../../../main.js").NanaiAndroidMascotApp
			).hideQuickActionsPanel();
		});

		document.addEventListener("contextmenu", (e: MouseEvent) => {
			e.preventDefault();
			(this as import("../../../main.js").NanaiAndroidMascotApp).toggleMenu(
				e.screenX,
				e.screenY,
			);
		});

		document.addEventListener("keydown", (e: KeyboardEvent) => {
			const key = e.key.toLowerCase();
			if (e.key === "Escape") {
				(
					this as import("../../../main.js").NanaiAndroidMascotApp
				).modalManager?.hide();
				(this as import("../../../main.js").NanaiAndroidMascotApp).hideMenu();
			} else if ((e.ctrlKey || e.metaKey) && (key === "w" || key === "q")) {
				e.preventDefault();
				(this as import("../../../main.js").NanaiAndroidMascotApp).closeApp();
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
			const data = event.payload;
			if (!data) return;
			if (data.action === "request-sync") {
				const reqScope = data.payload?.scope ?? 0;
				(
					this as import("../../../main.js").NanaiAndroidMascotApp
				).syncMenuGhosts(reqScope);
				return;
			}
			(
				this as import("../../../main.js").NanaiAndroidMascotApp
			).handleMenuAction(data.action, data.payload);
		};
		await listen("menu-action", forward);
		await listen("native-menu-action", forward);

		await listen("request-subchar-image", (event: unknown) => {
			const scopeId = event.payload?.scopeId;
			if (typeof scopeId === "number") {
				const cachedSrc = (
					this as unknown
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
					this as import("../../../main.js").NanaiAndroidMascotApp
				).syncMenuGhosts(reqScope);
				return;
			}
			(this as import("../../../main.js").NanaiAndroidMascotApp).hideMenu();
			(
				this as import("../../../main.js").NanaiAndroidMascotApp
			).handleMenuAction(action, event.data.payload);
		});
	},
};
