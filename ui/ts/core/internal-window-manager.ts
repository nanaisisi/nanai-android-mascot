/**
 * @file internal-window-manager.ts
 * @briefWebView / ブラウザ / Android上でネイティブウィンドウに依存せず動作する
 *       インナー仮想ウィンドウ（フローティングパネル）マネージャー
 */

export interface VirtualWindowOptions {
	scopeId: number | string;
	title?: string;
	x?: number;
	y?: number;
	width?: number;
	height?: number;
	className?: string;
}

export class VirtualWindow {
	id: string;
	scopeId: number | string;
	element: HTMLElement;
	contentElement: HTMLElement;
	isDragging: boolean;
	startX: number;
	startY: number;
	initialX: number;
	initialY: number;
	zIndex: number;

	constructor(options: VirtualWindowOptions, manager: InternalWindowManager) {
		this.scopeId = options.scopeId;
		this.id = `virtual_win_${options.scopeId}`;
		this.isDragging = false;
		this.startX = 0;
		this.startY = 0;
		this.initialX = options.x || 100;
		this.initialY = options.y || 100;
		this.zIndex = 100;

		this.element = document.createElement("div");
		this.element.id = this.id;
		this.element.className = `virtual-window ${options.className || ""}`;
		this.element.style.position = "absolute";
		this.element.style.left = `${this.initialX}px`;
		this.element.style.top = `${this.initialY}px`;
		if (options.width) this.element.style.width = `${options.width}px`;
		if (options.height) this.element.style.height = `${options.height}px`;
		this.element.style.zIndex = String(this.zIndex);

		this.contentElement = document.createElement("div");
		this.contentElement.className = "virtual-window-content";
		this.element.appendChild(this.contentElement);

		this.setupDragging(manager);
		this.element.addEventListener("mousedown", () =>
			manager.bringToFront(this),
		);
		this.element.addEventListener(
			"touchstart",
			() => manager.bringToFront(this),
			{ passive: true },
		);
	}

	setupDragging(manager: InternalWindowManager) {
		const onDown = (e: MouseEvent | TouchEvent) => {
			if (
				(e.target as HTMLElement).tagName === "BUTTON" ||
				(e.target as HTMLElement).closest("button")
			) {
				return;
			}
			this.isDragging = true;
			const clientX =
				"touches" in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
			const clientY =
				"touches" in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
			this.startX = clientX;
			this.startY = clientY;
			this.initialX = this.element.offsetLeft;
			this.initialY = this.element.offsetTop;
			manager.bringToFront(this);

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
				this.element.style.left = `${Math.max(0, this.initialX + dx)}px`;
				this.element.style.top = `${Math.max(0, this.initialY + dy)}px`;
			};

			const onUp = () => {
				this.isDragging = false;
				globalThis.removeEventListener("mousemove", onMove);
				globalThis.removeEventListener("mouseup", onUp);
				globalThis.removeEventListener("touchmove", onMove);
				globalThis.removeEventListener("touchend", onUp);
			};

			globalThis.addEventListener("mousemove", onMove);
			globalThis.addEventListener("mouseup", onUp);
			globalThis.addEventListener("touchmove", onMove, { passive: true });
			globalThis.addEventListener("touchend", onUp);
		};

		this.element.addEventListener("mousedown", onDown);
		this.element.addEventListener("touchstart", onDown, { passive: true });
	}

	show() {
		this.element.style.display = "block";
	}

	hide() {
		this.element.style.display = "none";
	}
}

export class InternalWindowManager {
	container: HTMLElement;
	windows: Map<number | string, VirtualWindow>;
	highestZIndex: number;

	constructor(containerElement?: HTMLElement | null) {
		this.container =
			containerElement ||
			document.getElementById("main-display") ||
			document.body;
		this.windows = new Map();
		this.highestZIndex = 1000;
	}

	getOrCreateWindow(options: VirtualWindowOptions): VirtualWindow {
		let win = this.windows.get(options.scopeId);
		if (!win) {
			win = new VirtualWindow(options, this);
			this.windows.set(options.scopeId, win);
			this.container.appendChild(win.element);
		}
		return win;
	}

	bringToFront(win: VirtualWindow) {
		this.highestZIndex++;
		win.zIndex = this.highestZIndex;
		win.element.style.zIndex = String(win.zIndex);
	}

	removeWindow(scopeId: number | string) {
		const win = this.windows.get(scopeId);
		if (win) {
			win.element.remove();
			this.windows.delete(scopeId);
		}
	}
}
