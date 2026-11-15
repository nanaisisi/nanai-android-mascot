/**
 * @file interactions.ts
 * @brief Focus, dragging, and resizing interactions for VirtualWindow
 */

import { VirtualWindowResizeDirection } from "../types.js";
import type { VirtualWindow } from "./class.js";

export function setupFocusHandling(win: VirtualWindow) {
	win.element.addEventListener("mousedown", () => {
		win.manager.bringToFront(win);
	});
	win.element.addEventListener(
		"touchstart",
		() => {
			win.manager.bringToFront(win);
		},
		{ passive: true },
	);
}

export function setupDragging(win: VirtualWindow) {
	const dragHandle = win.titleBarElement || win.element;

	const onDown = (e: MouseEvent | TouchEvent) => {
		const target = e.target as HTMLElement;
		if (
			target.tagName === "BUTTON" ||
			target.closest("button") ||
			target.classList.contains("vwin-resize-handle")
		) {
			return;
		}
		if (win.isMaximized) return;

		win.isDragging = true;
		win.element.classList.add("is-dragging");
		const clientX =
			"touches" in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
		const clientY =
			"touches" in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
		win.startX = clientX;
		win.startY = clientY;
		win.initialX = win.element.offsetLeft;
		win.initialY = win.element.offsetTop;
		win.manager.bringToFront(win);

		const onMove = (mvEvent: MouseEvent | TouchEvent) => {
			if (!win.isDragging) return;
			const mvX =
				"touches" in mvEvent
					? mvEvent.touches[0].clientX
					: (mvEvent as MouseEvent).clientX;
			const mvY =
				"touches" in mvEvent
					? mvEvent.touches[0].clientY
					: (mvEvent as MouseEvent).clientY;
			const dx = mvX - win.startX;
			const dy = mvY - win.startY;

			const parentW =
				win.manager.container.clientWidth || globalThis.innerWidth;
			const parentH =
				win.manager.container.clientHeight || globalThis.innerHeight;
			const winW = win.element.offsetWidth;

			// Snapping to edges if close to screen border (< 16px)
			let newX = win.initialX + dx;
			let newY = win.initialY + dy;

			if (newX < 16 && newX > -16) newX = 0;
			else if (parentW > 0 && Math.abs(parentW - (newX + winW)) < 16) {
				newX = parentW - winW;
			}

			if (newY < 16 && newY > -16) newY = 0;

			newX = Math.max(0, Math.min(newX, Math.max(0, parentW - 40)));
			newY = Math.max(0, Math.min(newY, Math.max(0, parentH - 30)));

			win.element.style.left = `${newX}px`;
			win.element.style.top = `${newY}px`;
		};

		const onUp = () => {
			win.isDragging = false;
			win.element.classList.remove("is-dragging");
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

export function setupResizing(
	win: VirtualWindow,
	handle: HTMLElement,
	dir: VirtualWindowResizeDirection,
) {
	const onDown = (e: MouseEvent | TouchEvent) => {
		e.stopPropagation();
		if (win.isMaximized || win.isMinimized) return;

		win.isResizing = true;
		win.currentResizeDir = dir;
		win.element.classList.add("is-resizing");
		const clientX =
			"touches" in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
		const clientY =
			"touches" in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
		win.startX = clientX;
		win.startY = clientY;
		win.initialX = win.element.offsetLeft;
		win.initialY = win.element.offsetTop;
		win.initialWidth = win.element.offsetWidth;
		win.initialHeight = win.element.offsetHeight;
		win.manager.bringToFront(win);

		const onMove = (mvEvent: MouseEvent | TouchEvent) => {
			if (!win.isResizing) return;
			const mvX =
				"touches" in mvEvent
					? mvEvent.touches[0].clientX
					: (mvEvent as MouseEvent).clientX;
			const mvY =
				"touches" in mvEvent
					? mvEvent.touches[0].clientY
					: (mvEvent as MouseEvent).clientY;
			const dx = mvX - win.startX;
			const dy = mvY - win.startY;

			let newW = win.initialWidth;
			let newH = win.initialHeight;
			let newX = win.initialX;
			let newY = win.initialY;

			if (dir.includes("e")) {
				newW = Math.max(win.minWidth, win.initialWidth + dx);
			}
			if (dir.includes("s")) {
				newH = Math.max(win.minHeight, win.initialHeight + dy);
			}
			if (dir.includes("w")) {
				const potW = win.initialWidth - dx;
				if (potW >= win.minWidth) {
					newW = potW;
					newX = win.initialX + dx;
				} else {
					newW = win.minWidth;
					newX = win.initialX + (win.initialWidth - win.minWidth);
				}
			}
			if (dir.includes("n")) {
				const potH = win.initialHeight - dy;
				if (potH >= win.minHeight) {
					newH = potH;
					newY = win.initialY + dy;
				} else {
					newH = win.minHeight;
					newY = win.initialY + (win.initialHeight - win.minHeight);
				}
			}

			win.element.style.width = `${newW}px`;
			win.element.style.height = `${newH}px`;
			win.element.style.left = `${newX}px`;
			win.element.style.top = `${newY}px`;
		};

		const onUp = () => {
			win.isResizing = false;
			win.currentResizeDir = null;
			win.element.classList.remove("is-resizing");
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
