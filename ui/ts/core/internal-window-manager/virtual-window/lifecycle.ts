/**
 * @file lifecycle.ts
 * @brief Lifecycle and state management actions for VirtualWindow
 */

import type { VirtualWindow } from "./class.js";

export function setTitle(win: VirtualWindow, title: string) {
	if (win.titleElement) {
		win.titleElement.textContent = title;
	}
}

export function toggleMinimize(win: VirtualWindow) {
	if (win.isMinimized) {
		win.restore();
	} else {
		win.minimize();
	}
}

export function minimize(win: VirtualWindow) {
	if (win.isMinimized) return;
	win.isMinimized = true;
	win.element.classList.add("is-minimized");
	win.contentElement.style.display = "none";
	for (const h of win.resizeHandles) {
		h.style.display = "none";
	}
}

export function restore(win: VirtualWindow) {
	if (win.isMinimized) {
		win.isMinimized = false;
		win.element.classList.remove("is-minimized");
		win.contentElement.style.display = "";
		for (const h of win.resizeHandles) {
			h.style.display = "";
		}
	}
	if (win.isMaximized) {
		win.isMaximized = false;
		win.element.classList.remove("is-maximized");
		if (win.savedGeometry) {
			win.element.style.left = `${win.savedGeometry.x}px`;
			win.element.style.top = `${win.savedGeometry.y}px`;
			win.element.style.width = `${win.savedGeometry.width}px`;
			win.element.style.height = `${win.savedGeometry.height}px`;
		}
	}
}

export function toggleMaximize(win: VirtualWindow) {
	if (win.isMaximized) {
		win.restore();
	} else {
		win.maximize();
	}
}

export function maximize(win: VirtualWindow) {
	if (win.isMinimized) {
		win.restore();
	}
	win.savedGeometry = {
		x: win.element.offsetLeft,
		y: win.element.offsetTop,
		width: win.element.offsetWidth,
		height: win.element.offsetHeight,
	};
	win.isMaximized = true;
	win.element.classList.add("is-maximized");
	win.element.style.left = "0px";
	win.element.style.top = "0px";
	win.element.style.width = "100%";
	win.element.style.height = "100%";
}

export function togglePin(win: VirtualWindow) {
	win.isPinned = !win.isPinned;
	if (win.isPinned) {
		win.element.classList.add("is-pinned");
		win.manager.bringToFront(win);
	} else {
		win.element.classList.remove("is-pinned");
	}
}

export function clampToViewport(
	win: VirtualWindow,
	viewportWidth?: number,
	viewportHeight?: number,
) {
	const vw =
		viewportWidth ??
		win.manager.container.clientWidth ??
		globalThis.innerWidth;
	const vh =
		viewportHeight ??
		win.manager.container.clientHeight ??
		globalThis.innerHeight;
	if (vw <= 0 || vh <= 0) return;

	let curX = win.element.offsetLeft;
	let curY = win.element.offsetTop;
	let curW = win.element.offsetWidth;
	let curH = win.element.offsetHeight;

	if (curW > vw) {
		curW = Math.max(win.minWidth, vw);
		win.element.style.width = `${curW}px`;
	}
	if (curH > vh) {
		curH = Math.max(win.minHeight, vh);
		win.element.style.height = `${curH}px`;
	}

	if (curX + curW > vw) {
		curX = Math.max(0, vw - curW);
	}
	if (curY + curH > vh) {
		curY = Math.max(0, vh - curH);
	}
	win.element.style.left = `${Math.max(0, curX)}px`;
	win.element.style.top = `${Math.max(0, curY)}px`;
}

export function show(win: VirtualWindow) {
	win.isVisible = true;
	win.element.style.display = "block";
	win.manager.bringToFront(win);
}

export function hide(win: VirtualWindow) {
	win.isVisible = false;
	win.element.style.display = "none";
}

export function close(win: VirtualWindow) {
	win.manager.removeWindow(win.scopeId);
}
