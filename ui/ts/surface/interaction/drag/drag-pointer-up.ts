import { isTauriAvailable } from "../../../core/tauri-helper.js";
import { applyDockingSnap, restoreFromDocking } from "./docking.js";

export interface ClickTrackerState {
	registerClick: (x: number, y: number, buttonKey?: string | number) => number;
	reset: () => void;
}

type PointerEventLike = {
	button?: number;
	clientX?: number;
	clientY?: number;
	changedTouches?: Array<{ clientX?: number; clientY?: number }>;
	touches?: Array<{ clientX?: number; clientY?: number }>;
	pointerType?: string;
};

type DragStateLike = {
	isInteracting: boolean;
	isDragging: boolean;
	startX: number;
	startY: number;
	hasMoved: boolean;
};

type LongPressLike = {
	cancel: () => void;
	isTriggered: () => boolean;
};

type StrokeTrackerLike = {
	isTriggered: () => boolean;
};

type NativeDragLike = {
	hasStarted: () => boolean;
};

type PointerUpOptionsLike = {
	enableDocking?: boolean;
	onGhostMultipleClick?: (
		x: number,
		y: number,
		rect: unknown,
		count: number,
		button: number | string,
		device: string,
		isEx: boolean,
	) => void;
	[key: string]: unknown;
};

export function createClickTracker(
	windowMs = 350,
	maxDist = 10,
): ClickTrackerState {
	let count = 0;
	let lastTime = 0;
	let lastX = 0;
	let lastY = 0;
	let lastButtonKey: string | number | null = null;

	return {
		registerClick(
			x: number,
			y: number,
			buttonKey: string | number = 0,
		): number {
			const now = Date.now();
			const isSameButton = lastButtonKey === buttonKey;
			const isWithinTime = count > 0 && now - lastTime <= windowMs;
			const isWithinDist = Math.hypot(x - lastX, y - lastY) <= maxDist;

			if (isSameButton && isWithinTime && isWithinDist) {
				count += 1;
			} else {
				count = 1;
			}

			lastTime = now;
			lastX = x;
			lastY = y;
			lastButtonKey = buttonKey;
			return count;
		},
		reset() {
			count = 0;
			lastTime = 0;
			lastX = 0;
			lastY = 0;
			lastButtonKey = null;
		},
	};
}

export function normalizePointerDevice(e: unknown): string {
	const ev = (e || {}) as PointerEventLike;
	if (
		ev.changedTouches ||
		ev.touches ||
		(ev.pointerType && ev.pointerType !== "mouse")
	) {
		return "touch";
	}
	return "mouse";
}

function dispatchLeftClick(
	clickX: number,
	clickY: number,
	currentRect: DOMRect,
	device: string,
	clickTracker: ClickTrackerState | undefined,
	onGhostClick: unknown,
	onGhostMultipleClick: PointerUpOptionsLike["onGhostMultipleClick"],
) {
	const clickCount = clickTracker
		? clickTracker.registerClick(clickX, clickY, 0)
		: 1;

	if (clickCount >= 3) {
		onGhostMultipleClick?.(
			clickX,
			clickY,
			currentRect,
			clickCount,
			0,
			device,
			false,
		);
		return;
	}

	if (typeof onGhostClick === "function") {
		const clickType = clickCount === 2 ? "double" : "single";
		(
			onGhostClick as (
				x: number,
				y: number,
				rect: unknown,
				clickType?: "single" | "double",
			) => unknown
		)(clickX, clickY, currentRect, clickType);
	}
}

export function handleGhostPointerUp(
	e: unknown,
	state: DragStateLike,
	target: HTMLElement,
	longPress: unknown,
	strokeTracker: unknown,
	nativeDrag: unknown,
	options: unknown,
	onGhostClick: unknown,
	onGhostDragEnd: unknown,
	onGhostMouseUp: unknown,
	clickTracker?: ClickTrackerState,
) {
	if (!state.isInteracting) return false;
	const ev = (e || {}) as PointerEventLike;
	const wasDragging = state.isDragging;
	state.isInteracting = false;
	target.classList.remove("is-dragging");

	const lp = longPress as LongPressLike;
	const st = strokeTracker as StrokeTrackerLike;
	const nd = nativeDrag as NativeDragLike;
	const opts = (options || {}) as PointerUpOptionsLike;

	lp.cancel();

	const touchPoint = ev.changedTouches?.[0] ?? ev.touches?.[0];
	const clientX = Number(ev.clientX ?? touchPoint?.clientX ?? state.startX);
	const clientY = Number(ev.clientY ?? touchPoint?.clientY ?? state.startY);
	const rect = target.getBoundingClientRect();
	const button = ev.button !== undefined ? ev.button : 0;
	const device = normalizePointerDevice(ev);

	if (wasDragging && typeof onGhostDragEnd === "function") {
		(onGhostDragEnd as (x: number, y: number, r: unknown) => unknown)(
			clientX,
			clientY,
			rect,
		);
	}

	if (typeof onGhostMouseUp === "function") {
		(
			onGhostMouseUp as (
				x: number,
				y: number,
				r: unknown,
				b: number,
				d: string,
			) => unknown
		)(clientX, clientY, rect, button, device);
	}

	if (lp.isTriggered() || st.isTriggered()) {
		return true;
	}

	if (nd.hasStarted()) {
		if (!state.hasMoved && button === 0) {
			dispatchLeftClick(
				clientX,
				clientY,
				rect,
				device,
				clickTracker,
				onGhostClick,
				opts.onGhostMultipleClick,
			);
		}
		target.classList.remove("is-dragging");
		return true;
	}

	if (state.isDragging) {
		if (!isTauriAvailable() || opts.enableDocking) {
			applyDockingSnap(target, globalThis.innerWidth);
		} else {
			target.classList.remove("is-docked-left", "is-docked-right");
		}
	} else {
		if (restoreFromDocking(target, globalThis.innerWidth)) {
			return true;
		}

		if (button === 0) {
			dispatchLeftClick(
				clientX,
				clientY,
				rect,
				device,
				clickTracker,
				onGhostClick,
				opts.onGhostMultipleClick,
			);
		}
	}
	return true;
}
