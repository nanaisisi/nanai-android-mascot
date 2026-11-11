import { isTauriAvailable } from "../../../core/tauri-helper.js";
import { applyDockingSnap, restoreFromDocking } from "./docking.js";

export function handleGhostPointerUp(
	e: unknown,
	state: {
		isInteracting: boolean;
		isDragging: boolean;
		startX: number;
		startY: number;
		hasMoved: boolean;
	},
	target: HTMLElement,
	longPress: unknown,
	strokeTracker: unknown,
	nativeDrag: unknown,
	options: unknown,
	onGhostClick: unknown,
	onGhostDragEnd: unknown,
	onGhostMouseUp: unknown,
) {
	if (!state.isInteracting) return false;
	const wasDragging = state.isDragging;
	state.isInteracting = false;
	target.classList.remove("is-dragging");

	longPress.cancel();

	const clientX = e.clientX ?? state.startX;
	const clientY = e.clientY ?? state.startY;
	const rect = target.getBoundingClientRect();

	if (wasDragging && onGhostDragEnd) {
		onGhostDragEnd(clientX, clientY, rect);
	}

	if (onGhostMouseUp) {
		const button = e.button !== undefined ? e.button : 0;
		const device = e.changedTouches ? "touch" : "mouse";
		onGhostMouseUp(clientX, clientY, rect, button, device);
	}

	if (longPress.isTriggered() || strokeTracker.isTriggered()) {
		return true;
	}

	if (nativeDrag.hasStarted()) {
		if (!state.hasMoved && onGhostClick) {
			const clickX = e.clientX ?? state.startX;
			const clickY = e.clientY ?? state.startY;
			const currentRect = target.getBoundingClientRect();
			onGhostClick(clickX, clickY, currentRect);
		}
		target.classList.remove("is-dragging");
		return true;
	}

	if (state.isDragging) {
		if (!isTauriAvailable() || options.enableDocking) {
			applyDockingSnap(target, globalThis.innerWidth);
		} else {
			target.classList.remove("is-docked-left", "is-docked-right");
		}
	} else {
		if (restoreFromDocking(target, globalThis.innerWidth)) {
			return true;
		}

		if (onGhostClick) {
			const clickX = e.clientX ?? state.startX;
			const clickY = e.clientY ?? state.startY;
			const currentRect = target.getBoundingClientRect();
			onGhostClick(clickX, clickY, currentRect);
		}
	}
	return true;
}
