/**
 * @file builders.ts
 * @brief DOM builders for VirtualWindow title bar and resize handles
 */

import { VirtualWindowResizeDirection } from "../types.js";
import type { VirtualWindow } from "./class.js";

export function buildTitleBar(win: VirtualWindow) {
	const bar = document.createElement("div");
	bar.className = "virtual-window-titlebar";

	const titleSpan = document.createElement("span");
	titleSpan.className = "virtual-window-title";
	titleSpan.textContent = win.options.title || `Window [${win.scopeId}]`;
	win.titleElement = titleSpan;
	bar.appendChild(titleSpan);

	const controls = document.createElement("div");
	controls.className = "virtual-window-controls";
	win.controlsElement = controls;

	if (win.options.pinnable) {
		const pinBtn = document.createElement("button");
		pinBtn.className = "vwin-btn vwin-btn-pin";
		pinBtn.title = "Pin Always on Top";
		pinBtn.innerHTML = "📌";
		pinBtn.addEventListener("click", (e) => {
			e.stopPropagation();
			win.togglePin();
		});
		controls.appendChild(pinBtn);
	}

	if (win.options.minimizable !== false) {
		const minBtn = document.createElement("button");
		minBtn.className = "vwin-btn vwin-btn-minimize";
		minBtn.title = "Minimize";
		minBtn.innerHTML = "−";
		minBtn.addEventListener("click", (e) => {
			e.stopPropagation();
			win.toggleMinimize();
		});
		controls.appendChild(minBtn);
	}

	if (win.options.maximizable !== false) {
		const maxBtn = document.createElement("button");
		maxBtn.className = "vwin-btn vwin-btn-maximize";
		maxBtn.title = "Maximize";
		maxBtn.innerHTML = "□";
		maxBtn.addEventListener("click", (e) => {
			e.stopPropagation();
			win.toggleMaximize();
		});
		controls.appendChild(maxBtn);
	}

	if (win.options.closable !== false) {
		const closeBtn = document.createElement("button");
		closeBtn.className = "vwin-btn vwin-btn-close";
		closeBtn.title = "Close";
		closeBtn.innerHTML = "×";
		closeBtn.addEventListener("click", (e) => {
			e.stopPropagation();
			win.close();
		});
		controls.appendChild(closeBtn);
	}

	bar.appendChild(controls);

	// Double-tap or double-click to maximize/restore
	bar.addEventListener("dblclick", () => {
		if (win.options.maximizable !== false) {
			win.toggleMaximize();
		}
	});

	win.titleBarElement = bar;
	win.element.appendChild(bar);
}

export function buildResizeHandles(win: VirtualWindow) {
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
		win.element.appendChild(handle);
		win.resizeHandles.push(handle);
		win.setupResizing(handle, dir);
	}
}
