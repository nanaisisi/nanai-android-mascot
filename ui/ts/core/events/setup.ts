import { emit, listen } from "../tauri-helper.js";

export const setupMethods = {
	async setupEventListeners() {
		(this as unknown).setupGhostInteractions();
		(this as unknown).setupUiButtons();
		(this as unknown).setupGlobalListeners();
		await (this as unknown).setupExternalMenuListeners();
	},

	setupGhostInteractions() {
		const bind = (el: HTMLElement | null, scopeId: number) => {
			if (!el || !(this as unknown).interactionManager) return;
			(this as unknown).interactionManager.setupDragging(
				el,
				(x: number, y: number, rect: unknown) =>
					(this as unknown).onGhostClick(x, y, rect, scopeId),
				(x: number, y: number, rect: unknown) =>
					(this as unknown).onGhostStroke(x, y, rect, scopeId),
				{
					onGhostMouseDown: (
						x: number,
						y: number,
						rect: unknown,
						button: number,
						device: string,
					) =>
						(this as unknown).onGhostMouseDown(
							x,
							y,
							rect,
							button,
							device,
							scopeId,
						),
					onGhostMouseUp: (
						x: number,
						y: number,
						rect: unknown,
						button: number,
						device: string,
					) =>
						(this as unknown).onGhostMouseUp(
							x,
							y,
							rect,
							button,
							device,
							scopeId,
						),
					onGhostWheel: (x: number, y: number, rect: unknown, delta: number) =>
						(this as unknown).onGhostWheel(x, y, rect, delta, scopeId),
					onGhostDragStart: (x: number, y: number, rect: unknown) =>
						(this as unknown).onGhostDragStart(x, y, rect, scopeId),
					onGhostDragEnd: (x: number, y: number, rect: unknown) =>
						(this as unknown).onGhostDragEnd(x, y, rect, scopeId),
					onGhostHover: (x: number, y: number, rect: unknown) =>
						(this as unknown).onGhostHover(x, y, rect, scopeId),
				},
			);
			el.addEventListener("contextmenu", (e: MouseEvent) => {
				e.preventDefault();
				e.stopPropagation();
				(this as unknown).toggleMenu(e.screenX, e.screenY, scopeId);
			});
		};
		bind((this as unknown).elements?.ghostDisplay, 0);
		bind((this as unknown).elements?.keroDisplay, 1);
	},

	setupUiButtons() {
		(this as unknown).elements?.menuBtn?.addEventListener(
			"click",
			(e: MouseEvent) => {
				e.stopPropagation();
				const rect = (this as unknown).elements.menuBtn.getBoundingClientRect();
				const sX = (globalThis as unknown).screenX ?? 0;
				const sY = (globalThis as unknown).screenY ?? 0;
				(this as unknown).toggleMenu(
					e.screenX || sX + rect.right,
					e.screenY || sY + rect.bottom,
				);
			},
		);

		(this as unknown).elements?.quickBubble?.addEventListener(
			"click",
			(e: MouseEvent) => {
				e.stopPropagation();
				(this as unknown).toggleQuickActionsPanel();
			},
		);

		const quick: Record<string, () => void> = {
			"qa-talk-btn": () => (this as unknown).onGhostClick(),
			"qa-ghost-btn": () => (this as unknown).switchToNextGhost(),
			"qa-balloon-btn": () => (this as unknown).handleMenuAction("balloon"),
			"qa-minimize-btn": () => (this as unknown).handleMenuAction("minimize"),
		};
		for (const [id, fn] of Object.entries(quick)) {
			document
				.getElementById(id)
				?.addEventListener("click", (e: MouseEvent) => {
					e.stopPropagation();
					(this as unknown).hideQuickActionsPanel();
					fn();
				});
		}

		(this as unknown).elements?.balloonDisplay?.addEventListener("click", () =>
			(this as unknown).sakuraPlayer?.skip(),
		);
	},

	setupGlobalListeners() {
		document.addEventListener("click", () => {
			(this as unknown).hideMenu();
			(this as unknown).hideQuickActionsPanel();
		});

		document.addEventListener("contextmenu", (e: MouseEvent) => {
			e.preventDefault();
			(this as unknown).toggleMenu(e.screenX, e.screenY);
		});

		document.addEventListener("keydown", (e: KeyboardEvent) => {
			const key = e.key.toLowerCase();
			if (e.key === "Escape") {
				(this as unknown).modalManager?.hide();
				(this as unknown).hideMenu();
			} else if ((e.ctrlKey || e.metaKey) && (key === "w" || key === "q")) {
				e.preventDefault();
				(this as unknown).closeApp();
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
				(this as unknown).syncMenuGhosts(reqScope);
				return;
			}
			(this as unknown).handleMenuAction(data.action, data.payload);
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
				(this as unknown).syncMenuGhosts(reqScope);
				return;
			}
			(this as unknown).hideMenu();
			(this as unknown).handleMenuAction(action, event.data.payload);
		});
	},
};
