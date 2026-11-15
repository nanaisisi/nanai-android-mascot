/**
 * @file class.ts
 * @brief VirtualWindow class orchestration delegating to builders, interactions, and lifecycle modules
 */

import type { InternalWindowManager } from "../window-manager.js";
import { VirtualWindowOptions, VirtualWindowResizeDirection, WindowGeometry } from "../types.js";
import { buildTitleBar, buildResizeHandles } from "./builders.js";
import { setupFocusHandling, setupDragging, setupResizing } from "./interactions.js";
import {
	setTitle,
	toggleMinimize,
	minimize,
	restore,
	toggleMaximize,
	maximize,
	togglePin,
	clampToViewport,
	show,
	hide,
	close,
} from "./lifecycle.js";

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
		buildTitleBar(this);
	}

	buildResizeHandles() {
		buildResizeHandles(this);
	}

	setupFocusHandling() {
		setupFocusHandling(this);
	}

	setupDragging() {
		setupDragging(this);
	}

	setupResizing(handle: HTMLElement, dir: VirtualWindowResizeDirection) {
		setupResizing(this, handle, dir);
	}

	setTitle(title: string) {
		setTitle(this, title);
	}

	toggleMinimize() {
		toggleMinimize(this);
	}

	minimize() {
		minimize(this);
	}

	restore() {
		restore(this);
	}

	toggleMaximize() {
		toggleMaximize(this);
	}

	maximize() {
		maximize(this);
	}

	togglePin() {
		togglePin(this);
	}

	clampToViewport(viewportWidth?: number, viewportHeight?: number) {
		clampToViewport(this, viewportWidth, viewportHeight);
	}

	show() {
		show(this);
	}

	hide() {
		hide(this);
	}

	close() {
		close(this);
	}
}
