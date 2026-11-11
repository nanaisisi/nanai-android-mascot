/**
 * @file internal-window-manager.ts
 * @brief WebView / ブラウザ / Android上でネイティブウィンドウに依存せず動作する
 *       インナー仮想ウィンドウ（フローティングパネル）マネージャー
 *       - タイトルバー、最小化/最大化/ピン留め/閉じる制御
 *       - 8方向リサイズハンドル、ドラッグ＆タッチ操作最適化
 *       - カスケード・タイル自動整列、画面外はみ出し防止クランプ
 *       - Android戻るボタン (BackButtonManager) スタック統合
 */

export interface VirtualWindowOptions {
	scopeId: number | string;
	title?: string;
	x?: number;
	y?: number;
	width?: number;
	height?: number;
	minWidth?: number;
	minHeight?: number;
	className?: string;
	resizable?: boolean;
	closable?: boolean;
	minimizable?: boolean;
	maximizable?: boolean;
	pinnable?: boolean;
	titleBar?: boolean;
}

export type VirtualWindowResizeDirection =
	| "n"
	| "s"
	| "e"
	| "w"
	| "ne"
	| "nw"
	| "se"
	| "sw";

export interface WindowGeometry {
	x: number;
	y: number;
	width: number;
	height: number;
}

export class VirtualWindow {
	id: string;
	scopeId: number | string;
	element: HTMLElement;
	contentElement: HTMLElement;
	titleBarElement: HTMLElement | null = null;
	titleElement: HTMLElement | null = null;
	controlsElement: HTMLElement | null = null;
	resizeHandles: HTMLElement[] = [];

	isDragging = false;
	isResizing = false;
	startX = 0;
	startY = 0;
	initialX = 100;
	initialY = 100;
	initialWidth = 200;
	initialHeight = 150;
	minWidth = 100;
	minHeight = 60;
	zIndex = 100;

	isMinimized = false;
	isMaximized = false;
	isPinned = false;
	isVisible = true;

	savedGeometry: WindowGeometry | null = null;
	currentResizeDir: VirtualWindowResizeDirection | null = null;
	options: VirtualWindowOptions;
	manager: InternalWindowManager;

	constructor(options: VirtualWindowOptions, manager: InternalWindowManager) {
		this.options = options;
		this.manager = manager;
		this.scopeId = options.scopeId;
		this.id = `virtual_win_${options.scopeId}`;
		this.initialX = options.x ?? 100;
		this.initialY = options.y ?? 100;
		this.initialWidth = options.width ?? 220;
		this.initialHeight = options.height ?? 160;
		this.minWidth = options.minWidth ?? 100;
		this.minHeight = options.minHeight ?? 60;
		this.zIndex = 100;

		this.element = document.createElement("div");
		this.element.id = this.id;
		this.element.className = `virtual-window ${options.className || ""}`;
		this.element.style.position = "absolute";
		this.element.style.left = `${this.initialX}px`;
		this.element.style.top = `${this.initialY}px`;
		this.element.style.width = `${this.initialWidth}px`;
		this.element.style.height = `${this.initialHeight}px`;
		this.element.style.zIndex = String(this.zIndex);

		if (options.titleBar !== false) {
			this.buildTitleBar();
		}

		this.contentElement = document.createElement("div");
		this.contentElement.className = "virtual-window-content";
		this.element.appendChild(this.contentElement);

		if (options.resizable !== false) {
			this.buildResizeHandles();
		}

		this.setupDragging();
		this.setupFocusHandling();
	}

	buildTitleBar() {
		const bar = document.createElement("div");
		bar.className = "virtual-window-titlebar";

		const titleSpan = document.createElement("span");
		titleSpan.className = "virtual-window-title";
		titleSpan.textContent = this.options.title || `Window [${this.scopeId}]`;
		this.titleElement = titleSpan;
		bar.appendChild(titleSpan);

		const controls = document.createElement("div");
		controls.className = "virtual-window-controls";
		this.controlsElement = controls;

		if (this.options.pinnable) {
			const pinBtn = document.createElement("button");
			pinBtn.className = "vwin-btn vwin-btn-pin";
			pinBtn.title = "Pin Always on Top";
			pinBtn.innerHTML = "📌";
			pinBtn.addEventListener("click", (e) => {
				e.stopPropagation();
				this.togglePin();
			});
			controls.appendChild(pinBtn);
		}

		if (this.options.minimizable !== false) {
			const minBtn = document.createElement("button");
			minBtn.className = "vwin-btn vwin-btn-minimize";
			minBtn.title = "Minimize";
			minBtn.innerHTML = "−";
			minBtn.addEventListener("click", (e) => {
				e.stopPropagation();
				this.toggleMinimize();
			});
			controls.appendChild(minBtn);
		}

		if (this.options.maximizable !== false) {
			const maxBtn = document.createElement("button");
			maxBtn.className = "vwin-btn vwin-btn-maximize";
			maxBtn.title = "Maximize";
			maxBtn.innerHTML = "□";
			maxBtn.addEventListener("click", (e) => {
				e.stopPropagation();
				this.toggleMaximize();
			});
			controls.appendChild(maxBtn);
		}

		if (this.options.closable !== false) {
			const closeBtn = document.createElement("button");
			closeBtn.className = "vwin-btn vwin-btn-close";
			closeBtn.title = "Close";
			closeBtn.innerHTML = "×";
			closeBtn.addEventListener("click", (e) => {
				e.stopPropagation();
				this.close();
			});
			controls.appendChild(closeBtn);
		}

		bar.appendChild(controls);

		// Double-tap or double-click to maximize/restore
		bar.addEventListener("dblclick", () => {
			if (this.options.maximizable !== false) {
				this.toggleMaximize();
			}
		});

		this.titleBarElement = bar;
		this.element.appendChild(bar);
	}

	buildResizeHandles() {
		const directions: VirtualWindowResizeDirection[] = [
			"n",
			"s",
			"e",
			"w",
			"ne",
			"nw",
			"se",
			"sw",
		];
		for (const dir of directions) {
			const handle = document.createElement("div");
			handle.className = `vwin-resize-handle vwin-resize-${dir}`;
			handle.dataset.dir = dir;
			this.element.appendChild(handle);
			this.resizeHandles.push(handle);
			this.setupResizing(handle, dir);
		}
	}

	setupFocusHandling() {
		this.element.addEventListener("mousedown", () => {
			this.manager.bringToFront(this);
		});
		this.element.addEventListener(
			"touchstart",
			() => {
				this.manager.bringToFront(this);
			},
			{ passive: true },
		);
	}

	setupDragging() {
		const dragHandle = this.titleBarElement || this.element;

		const onDown = (e: MouseEvent | TouchEvent) => {
			const target = e.target as HTMLElement;
			if (
				target.tagName === "BUTTON" ||
				target.closest("button") ||
				target.classList.contains("vwin-resize-handle")
			) {
				return;
			}
			if (this.isMaximized) return;

			this.isDragging = true;
			this.element.classList.add("is-dragging");
			const clientX =
				"touches" in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
			const clientY =
				"touches" in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
			this.startX = clientX;
			this.startY = clientY;
			this.initialX = this.element.offsetLeft;
			this.initialY = this.element.offsetTop;
			this.manager.bringToFront(this);

			const onMove = (mvEvent: MouseEvent | TouchEvent) => {
				if (!this.isDragging) return;
				const mvX =
					"touches" in mvEvent
						? mvEvent.touches[0].clientX
						: (mvEvent as MouseEvent).clientX;
				const mvY =
					"touches" in mvEvent
						? mvEvent.touches[0].clientY
						: (mvEvent as MouseEvent).clientY;
				const dx = mvX - this.startX;
				const dy = mvY - this.startY;

				const parentW =
					this.manager.container.clientWidth || globalThis.innerWidth;
				const parentH =
					this.manager.container.clientHeight || globalThis.innerHeight;
				const winW = this.element.offsetWidth;

				// Snapping to edges if close to screen border (< 16px)
				let newX = this.initialX + dx;
				let newY = this.initialY + dy;

				if (newX < 16 && newX > -16) newX = 0;
				else if (parentW > 0 && Math.abs(parentW - (newX + winW)) < 16) {
					newX = parentW - winW;
				}

				if (newY < 16 && newY > -16) newY = 0;

				newX = Math.max(0, Math.min(newX, Math.max(0, parentW - 40)));
				newY = Math.max(0, Math.min(newY, Math.max(0, parentH - 30)));

				this.element.style.left = `${newX}px`;
				this.element.style.top = `${newY}px`;
			};

			const onUp = () => {
				this.isDragging = false;
				this.element.classList.remove("is-dragging");
				if (typeof globalThis.removeEventListener === "function") {
					globalThis.removeEventListener("mousemove", onMove);
					globalThis.removeEventListener("mouseup", onUp);
					globalThis.removeEventListener("touchmove", onMove);
					globalThis.removeEventListener("touchend", onUp);
				}
			};

			if (typeof globalThis.addEventListener === "function") {
				globalThis.addEventListener("mousemove", onMove);
				globalThis.addEventListener("mouseup", onUp);
				globalThis.addEventListener("touchmove", onMove, { passive: true });
				globalThis.addEventListener("touchend", onUp);
			}
		};

		dragHandle.addEventListener("mousedown", onDown);
		dragHandle.addEventListener("touchstart", onDown, { passive: true });
	}

	setupResizing(handle: HTMLElement, dir: VirtualWindowResizeDirection) {
		const onDown = (e: MouseEvent | TouchEvent) => {
			e.stopPropagation();
			if (this.isMaximized || this.isMinimized) return;

			this.isResizing = true;
			this.currentResizeDir = dir;
			this.element.classList.add("is-resizing");
			const clientX =
				"touches" in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
			const clientY =
				"touches" in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
			this.startX = clientX;
			this.startY = clientY;
			this.initialX = this.element.offsetLeft;
			this.initialY = this.element.offsetTop;
			this.initialWidth = this.element.offsetWidth;
			this.initialHeight = this.element.offsetHeight;
			this.manager.bringToFront(this);

			const onMove = (mvEvent: MouseEvent | TouchEvent) => {
				if (!this.isResizing) return;
				const mvX =
					"touches" in mvEvent
						? mvEvent.touches[0].clientX
						: (mvEvent as MouseEvent).clientX;
				const mvY =
					"touches" in mvEvent
						? mvEvent.touches[0].clientY
						: (mvEvent as MouseEvent).clientY;
				const dx = mvX - this.startX;
				const dy = mvY - this.startY;

				let newW = this.initialWidth;
				let newH = this.initialHeight;
				let newX = this.initialX;
				let newY = this.initialY;

				if (dir.includes("e")) {
					newW = Math.max(this.minWidth, this.initialWidth + dx);
				}
				if (dir.includes("s")) {
					newH = Math.max(this.minHeight, this.initialHeight + dy);
				}
				if (dir.includes("w")) {
					const potW = this.initialWidth - dx;
					if (potW >= this.minWidth) {
						newW = potW;
						newX = this.initialX + dx;
					} else {
						newW = this.minWidth;
						newX = this.initialX + (this.initialWidth - this.minWidth);
					}
				}
				if (dir.includes("n")) {
					const potH = this.initialHeight - dy;
					if (potH >= this.minHeight) {
						newH = potH;
						newY = this.initialY + dy;
					} else {
						newH = this.minHeight;
						newY = this.initialY + (this.initialHeight - this.minHeight);
					}
				}

				this.element.style.width = `${newW}px`;
				this.element.style.height = `${newH}px`;
				this.element.style.left = `${newX}px`;
				this.element.style.top = `${newY}px`;
			};

			const onUp = () => {
				this.isResizing = false;
				this.currentResizeDir = null;
				this.element.classList.remove("is-resizing");
				if (typeof globalThis.removeEventListener === "function") {
					globalThis.removeEventListener("mousemove", onMove);
					globalThis.removeEventListener("mouseup", onUp);
					globalThis.removeEventListener("touchmove", onMove);
					globalThis.removeEventListener("touchend", onUp);
				}
			};

			if (typeof globalThis.addEventListener === "function") {
				globalThis.addEventListener("mousemove", onMove);
				globalThis.addEventListener("mouseup", onUp);
				globalThis.addEventListener("touchmove", onMove, { passive: true });
				globalThis.addEventListener("touchend", onUp);
			}
		};

		handle.addEventListener("mousedown", onDown);
		handle.addEventListener("touchstart", onDown, { passive: true });
	}

	setTitle(title: string) {
		if (this.titleElement) {
			this.titleElement.textContent = title;
		}
	}

	toggleMinimize() {
		if (this.isMinimized) {
			this.restore();
		} else {
			this.minimize();
		}
	}

	minimize() {
		if (this.isMinimized) return;
		this.isMinimized = true;
		this.element.classList.add("is-minimized");
		this.contentElement.style.display = "none";
		for (const h of this.resizeHandles) {
			h.style.display = "none";
		}
	}

	restore() {
		if (this.isMinimized) {
			this.isMinimized = false;
			this.element.classList.remove("is-minimized");
			this.contentElement.style.display = "";
			for (const h of this.resizeHandles) {
				h.style.display = "";
			}
		}
		if (this.isMaximized) {
			this.isMaximized = false;
			this.element.classList.remove("is-maximized");
			if (this.savedGeometry) {
				this.element.style.left = `${this.savedGeometry.x}px`;
				this.element.style.top = `${this.savedGeometry.y}px`;
				this.element.style.width = `${this.savedGeometry.width}px`;
				this.element.style.height = `${this.savedGeometry.height}px`;
			}
		}
	}

	toggleMaximize() {
		if (this.isMaximized) {
			this.restore();
		} else {
			this.maximize();
		}
	}

	maximize() {
		if (this.isMinimized) {
			this.restore();
		}
		this.savedGeometry = {
			x: this.element.offsetLeft,
			y: this.element.offsetTop,
			width: this.element.offsetWidth,
			height: this.element.offsetHeight,
		};
		this.isMaximized = true;
		this.element.classList.add("is-maximized");
		this.element.style.left = "0px";
		this.element.style.top = "0px";
		this.element.style.width = "100%";
		this.element.style.height = "100%";
	}

	togglePin() {
		this.isPinned = !this.isPinned;
		if (this.isPinned) {
			this.element.classList.add("is-pinned");
			this.manager.bringToFront(this);
		} else {
			this.element.classList.remove("is-pinned");
		}
	}

	clampToViewport(viewportWidth?: number, viewportHeight?: number) {
		const vw =
			viewportWidth ??
			this.manager.container.clientWidth ??
			globalThis.innerWidth;
		const vh =
			viewportHeight ??
			this.manager.container.clientHeight ??
			globalThis.innerHeight;
		if (vw <= 0 || vh <= 0) return;

		let curX = this.element.offsetLeft;
		let curY = this.element.offsetTop;
		let curW = this.element.offsetWidth;
		let curH = this.element.offsetHeight;

		if (curW > vw) {
			curW = Math.max(this.minWidth, vw);
			this.element.style.width = `${curW}px`;
		}
		if (curH > vh) {
			curH = Math.max(this.minHeight, vh);
			this.element.style.height = `${curH}px`;
		}

		if (curX + curW > vw) {
			curX = Math.max(0, vw - curW);
		}
		if (curY + curH > vh) {
			curY = Math.max(0, vh - curH);
		}
		this.element.style.left = `${Math.max(0, curX)}px`;
		this.element.style.top = `${Math.max(0, curY)}px`;
	}

	show() {
		this.isVisible = true;
		this.element.style.display = "block";
		this.manager.bringToFront(this);
	}

	hide() {
		this.isVisible = false;
		this.element.style.display = "none";
	}

	close() {
		this.manager.removeWindow(this.scopeId);
	}
}

export class InternalWindowManager {
	container: HTMLElement;
	windows: Map<number | string, VirtualWindow>;
	highestZIndex: number;
	pinnedZIndexOffset: number;
	activeWindowId: number | string | null = null;
	private _cleanupHandlers: Array<() => void> = [];

	constructor(containerElement?: HTMLElement | null) {
		this.container =
			containerElement ||
			document.getElementById("main-display") ||
			document.body;
		this.windows = new Map();
		this.highestZIndex = 1000;
		this.pinnedZIndexOffset = 5000;

		this.setupViewportListener();
	}

	private setupViewportListener() {
		const onResize = () => {
			this.clampAllWindows();
		};
		if (typeof globalThis.addEventListener === "function") {
			globalThis.addEventListener("resize", onResize);
			globalThis.addEventListener("orientationchange", onResize);
			this._cleanupHandlers.push(() => {
				if (typeof globalThis.removeEventListener === "function") {
					globalThis.removeEventListener("resize", onResize);
					globalThis.removeEventListener("orientationchange", onResize);
				}
			});
		}
	}

	getOrCreateWindow(options: VirtualWindowOptions): VirtualWindow {
		let win = this.windows.get(options.scopeId);
		if (!win) {
			win = new VirtualWindow(options, this);
			this.windows.set(options.scopeId, win);
			this.container.appendChild(win.element);
			this.bringToFront(win);
		}
		return win;
	}

	getWindow(scopeId: number | string): VirtualWindow | undefined {
		return this.windows.get(scopeId);
	}

	getAllWindows(): VirtualWindow[] {
		return Array.from(this.windows.values());
	}

	getActiveWindow(): VirtualWindow | null {
		if (this.activeWindowId === null) return null;
		return this.windows.get(this.activeWindowId) || null;
	}

	bringToFront(win: VirtualWindow) {
		this.highestZIndex++;
		const baseZ = win.isPinned
			? this.highestZIndex + this.pinnedZIndexOffset
			: this.highestZIndex;
		win.zIndex = baseZ;
		win.element.style.zIndex = String(win.zIndex);

		for (const w of this.windows.values()) {
			w.element.classList.remove("is-focused");
		}
		win.element.classList.add("is-focused");
		this.activeWindowId = win.scopeId;
	}

	sendToBack(win: VirtualWindow) {
		let lowest = 1000;
		for (const w of this.windows.values()) {
			if (w.zIndex < lowest) lowest = w.zIndex;
		}
		win.zIndex = Math.max(1, lowest - 1);
		win.element.style.zIndex = String(win.zIndex);
		win.element.classList.remove("is-focused");
		if (this.activeWindowId === win.scopeId) {
			this.activeWindowId = null;
		}
	}

	removeWindow(scopeId: number | string) {
		const win = this.windows.get(scopeId);
		if (win) {
			win.element.remove();
			this.windows.delete(scopeId);
			if (this.activeWindowId === scopeId) {
				this.activeWindowId = null;
				// Activate the topmost remaining window
				let highest: VirtualWindow | null = null;
				for (const w of this.windows.values()) {
					if (!highest || w.zIndex > highest.zIndex) {
						highest = w;
					}
				}
				if (highest) {
					this.bringToFront(highest);
				}
			}
		}
	}

	clampAllWindows() {
		const vw = this.container.clientWidth || globalThis.innerWidth;
		const vh = this.container.clientHeight || globalThis.innerHeight;
		for (const win of this.windows.values()) {
			win.clampToViewport(vw, vh);
		}
	}

	cascadeWindows(startX = 20, startY = 20, step = 30) {
		let currentX = startX;
		let currentY = startY;
		const parentW = this.container.clientWidth || globalThis.innerWidth;
		const parentH = this.container.clientHeight || globalThis.innerHeight;

		for (const win of this.windows.values()) {
			if (win.isMaximized) win.restore();
			win.element.style.left = `${currentX}px`;
			win.element.style.top = `${currentY}px`;
			this.bringToFront(win);

			currentX += step;
			currentY += step;
			if (currentX + 150 > parentW) currentX = startX;
			if (currentY + 150 > parentH) currentY = startY;
		}
	}

	tileWindows() {
		const winList = Array.from(this.windows.values()).filter(
			(w) => w.isVisible,
		);
		const count = winList.length;
		if (count === 0) return;

		const parentW = this.container.clientWidth || globalThis.innerWidth;
		const parentH = this.container.clientHeight || globalThis.innerHeight;

		const cols = Math.ceil(Math.sqrt(count));
		const rows = Math.ceil(count / cols);
		const cellW = Math.floor(parentW / cols);
		const cellH = Math.floor(parentH / rows);

		winList.forEach((win, index) => {
			if (win.isMaximized) win.restore();
			const r = Math.floor(index / cols);
			const c = index % cols;
			win.element.style.left = `${c * cellW}px`;
			win.element.style.top = `${r * cellH}px`;
			win.element.style.width = `${cellW}px`;
			win.element.style.height = `${cellH}px`;
		});
	}

	minimizeAll() {
		for (const win of this.windows.values()) {
			win.minimize();
		}
	}

	restoreAll() {
		for (const win of this.windows.values()) {
			win.restore();
		}
	}

	closeAll() {
		const keys = Array.from(this.windows.keys());
		for (const k of keys) {
			this.removeWindow(k);
		}
	}

	registerToBackButtonManager(backButtonManager: {
		registerBackHandler: (fn: () => boolean | Promise<boolean>) => () => void;
	}): () => void {
		if (
			!backButtonManager ||
			typeof backButtonManager.registerBackHandler !== "function"
		) {
			return () => {};
		}

		const unregister = backButtonManager.registerBackHandler(() => {
			const active = this.getActiveWindow();
			if (active?.isVisible) {
				if (active.isMaximized) {
					active.restore();
					return true;
				}
				if (!active.isMinimized && active.options.minimizable !== false) {
					active.minimize();
					return true;
				}
				if (active.options.closable !== false) {
					active.close();
					return true;
				}
			}
			return false;
		});

		this._cleanupHandlers.push(unregister);
		return unregister;
	}

	destroy() {
		for (const fn of this._cleanupHandlers) {
			try {
				fn();
			} catch (_) {}
		}
		this._cleanupHandlers = [];
		this.closeAll();
	}
}
