/**
 * @file window-manager.ts
 * @brief InternalWindowManager class for managing multiple VirtualWindows
 */

import { VirtualWindow } from "./virtual-window.js";
import { VirtualWindowOptions } from "./types.js";

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
