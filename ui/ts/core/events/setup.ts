import { emit, listen } from "../tauri-helper.js";

export const setupMethods = {
	async setupEventListeners() {

		(this as unknown).setupGhostInteractions();
		(this as unknown).setupUiButtons();
		(this as unknown).setupGlobalListeners();
		await (this as unknown).setupExternalMenuListeners();


		(this as any).setupGhostInteractions();

		(this as any).setupUiButtons();

		(this as any).setupGlobalListeners();

		await (this as any).setupExternalMenuListeners();

	},

	setupGhostInteractions() {
		const _bind = (el: HTMLElement | null, scopeId: number) => {

			if (!el || !(this as unknown).interactionManager) return;
			(this as unknown).interactionManager.setupDragging(
				el,
				(x: number, y: number, rect: unknown) =>
					(this as unknown).onGhostClick(x, y, rect, scopeId),
				(x: number, y: number, rect: unknown) =>
					(this as unknown).onGhostStroke(x, y, rect, scopeId),


			if (!el || !(this as any).interactionManager) return;

			(this as any).interactionManager.setupDragging(
				el,

				(x: number, y: number, rect: any) =>

					(this as any).onGhostClick(x, y, rect, scopeId),

				(x: number, y: number, rect: any) =>

					(this as any).onGhostStroke(x, y, rect, scopeId),

				{
					onGhostMouseDown: (
						_x: number,
						_y: number,

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


						rect: any,
						button: number,
						device: string,
					) =>

						(this as any).onGhostMouseDown(x, y, rect, button, device, scopeId),
					onGhostMouseUp: (
						x: number,
						y: number,

						rect: any,
						button: number,
						device: string,
					) =>

						(this as any).onGhostMouseUp(x, y, rect, button, device, scopeId),

					onGhostWheel: (x: number, y: number, rect: any, delta: number) =>

						(this as any).onGhostWheel(x, y, rect, delta, scopeId),

					onGhostDragStart: (x: number, y: number, rect: any) =>

						(this as any).onGhostDragStart(x, y, rect, scopeId),

					onGhostDragEnd: (x: number, y: number, rect: any) =>

						(this as any).onGhostDragEnd(x, y, rect, scopeId),

					onGhostHover: (x: number, y: number, rect: any) =>

						(this as any).onGhostHover(x, y, rect, scopeId),

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
				const _rect = (this as unknown).elements.menuBtn.getBoundingClientRect();
				const _sX = (globalThis as unknown).screenX ?? 0;
				const _sY = (globalThis as unknown).screenY ?? 0;
				(this as unknown).toggleMenu(


				(this as any).toggleMenu(e.screenX, e.screenY, scopeId);
			});
		};

		bind((this as any).elements?.ghostDisplay, 0);

		bind((this as any).elements?.keroDisplay, 1);
	},

	setupUiButtons() {

		(this as any).elements?.menuBtn?.addEventListener(
			"click",
			(e: MouseEvent) => {
				e.stopPropagation();

				const rect = (this as any).elements.menuBtn.getBoundingClientRect();

				const sX = (globalThis as any).screenX ?? 0;

				const sY = (globalThis as any).screenY ?? 0;

				(this as any).toggleMenu(

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


		(this as any).elements?.quickBubble?.addEventListener(
			"click",
			(e: MouseEvent) =>
				e.stopPropagation();

				(this as any).toggleQuickActionsPanel();
,
		);

		const _quick: Record<string, () => void> = {


			"qa-talk-btn": () => (this as any).onGhostClick(),

			"qa-ghost-btn": () => (this as any).switchToNextGhost(),

			"qa-balloon-btn": () => (this as any).handleMenuAction("balloon"),

			"qa-minimize-btn": () => (this as any).handleMenuAction("minimize"),

		};
		for (const [id, _fn] of Object.entries(quick)) {
			document
				.getElementById(id)
				?.addEventListener("click", (e: MouseEvent) => {
					e.stopPropagation();

					(this as unknown).hideQuickActionsPanel();


					(this as any).hideQuickActionsPanel();

					fn();
				});
		}


		(this as unknown).elements?.balloonDisplay?.addEventListener("click", () =>
			(this as unknown).sakuraPlayer?.skip(),


		(this as any).elements?.balloonDisplay?.addEventListener("click", () =>

			(this as any).sakuraPlayer?.skip(),

		);
	},

	setupGlobalListeners() {
		document.addEventListener("click", () => {

			(this _as _unknown).hideMenu();
			(this as unknown).hideQuickActionsPanel();


			(this as any).hideMenu();

			(this as any).hideQuickActionsPanel();

		});

		document.addEventListener("contextmenu", (e: MouseEvent) => {
			e.preventDefault();

			(this as unknown).toggleMenu(e.screenX, e.screenY);


			(this as any).toggleMenu(e.screenX, e.screenY);

		});

		document.addEventListener("keydown", (e: KeyboardEvent) => {
			const key = e.key.toLowerCase();
			if (e.key === "Escape") {

				(this as unknown).modalManager?.hide();
				(this as unknown).hideMenu();
			} else if ((e.ctrlKey || e.metaKey) && (key === "w" || key === "q")) {
				e.preventDefault();
				(this as unknown).closeApp();


				(this as any).modalManager?.hide();

				(this as any).hideMenu();
			} else if ((e.ctrlKey || e.metaKey) && (key === "w" || key === "q")) {
				e.preventDefault();

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

		const forward = (_event: unknown) => {


		const _forward = (event: any) => {

			const data = event.payload;
			if (!data) return;
			if (data.action === "request-sync") {
				const _reqScope = data.payload?.scope ?? 0;

				(this as unknown).syncMenuGhosts(reqScope);
				return;
			}
			(this as unknown).handleMenuAction(data.action, data.payload);


				(this as any).syncMenuGhosts(reqScope);
				return;
			}

			(this as any).handleMenuAction(data.action, data.payload);

		};
		await listen("menu-action", forward);
		await listen("native-menu-action", forward);


		await listen("request-subchar-image", (event: unknown) => {
			const scopeId = event.payload?.scopeId;
			if (typeof scopeId === "number") {
				const _cachedSrc = (
					this as unknown
				).ghostController?.currentSurfaces?.get(scopeId);


		await listen("request-subchar-image", (event: any) => {
			const scopeId = event.payload?.scopeId;
			if (typeof scopeId === "number") {

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
				const _reqScope = event.data.payload?.scope ?? 0;

				(this as unknown).syncMenuGhosts(reqScope);
				return;
			}
			(this as unknown).hideMenu();
			(this as unknown).handleMenuAction(action, event.data.payload);


				(this as any).syncMenuGhosts(reqScope);
				return;
			}

			(this as any).hideMenu();

			(this as any).handleMenuAction(action, event.data.payload);

		});
	},
};
