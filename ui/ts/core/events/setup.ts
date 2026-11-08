import { emit, listen } from "../tauri-helper.js";

export const setupMethods = {
	async setupEventListeners() {
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		(this as any).setupGhostInteractions();
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		(this as any).setupUiButtons();
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		(this as any).setupGlobalListeners();
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		await (this as any).setupExternalMenuListeners();
	},

	setupGhostInteractions() {
		const bind = (el: HTMLElement | null, scopeId: number) => {
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			if (!el || !(this as any).interactionManager) return;
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			(this as any).interactionManager.setupDragging(
				el,
				// biome-ignore lint/suspicious/noExplicitAny: automated fix
				(x: number, y: number, rect: any) =>
					// biome-ignore lint/suspicious/noExplicitAny: automated fix
					(this as any).onGhostClick(x, y, rect, scopeId),
				// biome-ignore lint/suspicious/noExplicitAny: automated fix
				(x: number, y: number, rect: any) =>
					// biome-ignore lint/suspicious/noExplicitAny: automated fix
					(this as any).onGhostStroke(x, y, rect, scopeId),
				{
					onGhostMouseDown: (
						x: number,
						y: number,
						// biome-ignore lint/suspicious/noExplicitAny: automated fix
						rect: any,
						button: number,
						device: string,
					) =>
						// biome-ignore lint/suspicious/noExplicitAny: automated fix
						(this as any).onGhostMouseDown(x, y, rect, button, device, scopeId),
					onGhostMouseUp: (
						x: number,
						y: number,
						// biome-ignore lint/suspicious/noExplicitAny: automated fix
						rect: any,
						button: number,
						device: string,
					) =>
						// biome-ignore lint/suspicious/noExplicitAny: automated fix
						(this as any).onGhostMouseUp(x, y, rect, button, device, scopeId),
					// biome-ignore lint/suspicious/noExplicitAny: automated fix
					onGhostWheel: (x: number, y: number, rect: any, delta: number) =>
						// biome-ignore lint/suspicious/noExplicitAny: automated fix
						(this as any).onGhostWheel(x, y, rect, delta, scopeId),
					// biome-ignore lint/suspicious/noExplicitAny: automated fix
					onGhostDragStart: (x: number, y: number, rect: any) =>
						// biome-ignore lint/suspicious/noExplicitAny: automated fix
						(this as any).onGhostDragStart(x, y, rect, scopeId),
					// biome-ignore lint/suspicious/noExplicitAny: automated fix
					onGhostDragEnd: (x: number, y: number, rect: any) =>
						// biome-ignore lint/suspicious/noExplicitAny: automated fix
						(this as any).onGhostDragEnd(x, y, rect, scopeId),
					// biome-ignore lint/suspicious/noExplicitAny: automated fix
					onGhostHover: (x: number, y: number, rect: any) =>
						// biome-ignore lint/suspicious/noExplicitAny: automated fix
						(this as any).onGhostHover(x, y, rect, scopeId),
				},
			);
			el.addEventListener("contextmenu", (e: MouseEvent) => {
				e.preventDefault();
				e.stopPropagation();
				// biome-ignore lint/suspicious/noExplicitAny: automated fix
				(this as any).toggleMenu(e.screenX, e.screenY, scopeId);
			});
		};
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		bind((this as any).elements?.ghostDisplay, 0);
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		bind((this as any).elements?.keroDisplay, 1);
	},

	setupUiButtons() {
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		(this as any).elements?.menuBtn?.addEventListener(
			"click",
			(e: MouseEvent) => {
				e.stopPropagation();
				// biome-ignore lint/suspicious/noExplicitAny: automated fix
				const rect = (this as any).elements.menuBtn.getBoundingClientRect();
				// biome-ignore lint/suspicious/noExplicitAny: automated fix
				const sX = (globalThis as any).screenX ?? 0;
				// biome-ignore lint/suspicious/noExplicitAny: automated fix
				const sY = (globalThis as any).screenY ?? 0;
				// biome-ignore lint/suspicious/noExplicitAny: automated fix
				(this as any).toggleMenu(
					e.screenX || sX + rect.right,
					e.screenY || sY + rect.bottom,
				);
			},
		);

		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		(this as any).elements?.quickBubble?.addEventListener(
			"click",
			(e: MouseEvent) => {
				e.stopPropagation();
				// biome-ignore lint/suspicious/noExplicitAny: automated fix
				(this as any).toggleQuickActionsPanel();
			},
		);

		const quick: Record<string, () => void> = {
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			"qa-talk-btn": () => (this as any).onGhostClick(),
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			"qa-ghost-btn": () => (this as any).switchToNextGhost(),
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			"qa-balloon-btn": () => (this as any).handleMenuAction("balloon"),
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			"qa-minimize-btn": () => (this as any).handleMenuAction("minimize"),
		};
		for (const [id, fn] of Object.entries(quick)) {
			document
				.getElementById(id)
				?.addEventListener("click", (e: MouseEvent) => {
					e.stopPropagation();
					// biome-ignore lint/suspicious/noExplicitAny: automated fix
					(this as any).hideQuickActionsPanel();
					fn();
				});
		}

		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		(this as any).elements?.balloonDisplay?.addEventListener("click", () =>
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			(this as any).sakuraPlayer?.skip(),
		);
	},

	setupGlobalListeners() {
		document.addEventListener("click", () => {
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			(this as any).hideMenu();
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			(this as any).hideQuickActionsPanel();
		});

		document.addEventListener("contextmenu", (e: MouseEvent) => {
			e.preventDefault();
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			(this as any).toggleMenu(e.screenX, e.screenY);
		});

		document.addEventListener("keydown", (e: KeyboardEvent) => {
			const key = e.key.toLowerCase();
			if (e.key === "Escape") {
				// biome-ignore lint/suspicious/noExplicitAny: automated fix
				(this as any).modalManager?.hide();
				// biome-ignore lint/suspicious/noExplicitAny: automated fix
				(this as any).hideMenu();
			} else if ((e.ctrlKey || e.metaKey) && (key === "w" || key === "q")) {
				e.preventDefault();
				// biome-ignore lint/suspicious/noExplicitAny: automated fix
				(this as any).closeApp();
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
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		const forward = (event: any) => {
			const data = event.payload;
			if (!data) return;
			if (data.action === "request-sync") {
				const reqScope = data.payload?.scope ?? 0;
				// biome-ignore lint/suspicious/noExplicitAny: automated fix
				(this as any).syncMenuGhosts(reqScope);
				return;
			}
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			(this as any).handleMenuAction(data.action, data.payload);
		};
		await listen("menu-action", forward);
		await listen("native-menu-action", forward);

		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		await listen("request-subchar-image", (event: any) => {
			const scopeId = event.payload?.scopeId;
			if (typeof scopeId === "number") {
				// biome-ignore lint/suspicious/noExplicitAny: automated fix
				const cachedSrc = (this as any).ghostController?.currentSurfaces?.get(
					scopeId,
				);
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
				// biome-ignore lint/suspicious/noExplicitAny: automated fix
				(this as any).syncMenuGhosts(reqScope);
				return;
			}
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			(this as any).hideMenu();
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			(this as any).handleMenuAction(action, event.data.payload);
		});
	},
};
