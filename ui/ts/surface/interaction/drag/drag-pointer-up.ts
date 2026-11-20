import { PhysicalPosition } from "@tauri-apps/api/dpi";
import { listen } from "@tauri-apps/api/event";
import {
	availableMonitors,
	currentMonitor,
	getAllWindows,
	getCurrentWindow,
	primaryMonitor,
} from "@tauri-apps/api/window";
import { isTauriAvailable } from "../../../core/tauri-helper.js";
import { applyDockingSnap, restoreFromDocking } from "./docking.js";
import {
	calculateCharacterSnap,
	computeOpaqueImageBounds,
	type MonitorLike,
	pickMonitorWorkArea,
	resolveOtherCharacterSnapRect,
	type SnapWindowRect,
	saveCharacterBoundsForSnap,
} from "./snap.js";

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
		if (!isTauriAvailable()) {
			applyDockingSnap(target, globalThis.innerWidth);
		} else {
			target.classList.remove("is-docked-left", "is-docked-right");
			void snapMainWindowOnDragEnd(
				target,
				Boolean((e as { ctrlKey?: boolean }).ctrlKey),
			);
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

let mainInitialPos: { x: number; y: number } | null = null;

export function captureMainInitialPosition(): void {
	if (!isTauriAvailable()) return;
	void Promise.resolve(getCurrentWindow().outerPosition())
		.then((pos) => {
			if (pos && Number.isFinite(pos.x) && Number.isFinite(pos.y)) {
				mainInitialPos = { x: pos.x, y: pos.y };
			}
		})
		.catch(() => {});
}

if (isTauriAvailable()) {
	if (typeof document !== "undefined") {
		document.addEventListener(
			"pointerdown",
			() => {
				if (mainInitialPos === null) {
					captureMainInitialPosition();
				}
			},
			{ once: true, capture: true },
		);
	}
	void Promise.resolve(
		listen("character-position-reset", () => {
			captureMainInitialPosition();
		}),
	).catch(() => {});
}

async function snapMainWindowOnDragEnd(
	target: HTMLElement,
	isCtrlPressed: boolean,
): Promise<void> {
	if (isCtrlPressed) return;
	try {
		const currentWin = getCurrentWindow();
		const [pos, size, availRes, allWindowsRes] = await Promise.all([
			currentWin.outerPosition(),
			currentWin.outerSize(),
			availableMonitors().catch(() => null),
			getAllWindows().catch(() => null),
		]);
		if (mainInitialPos === null) {
			mainInitialPos = { x: pos.x, y: pos.y };
		}
		const monitors: MonitorLike[] = Array.isArray(availRes)
			? availRes.filter((m): m is NonNullable<typeof m> => Boolean(m))
			: [];
		if (monitors.length === 0) {
			const mon = (await currentMonitor()) ?? (await primaryMonitor());
			if (mon) monitors.push(mon);
		}
		const workArea = pickMonitorWorkArea(
			monitors,
			pos.x,
			pos.y,
			size.width,
			size.height,
			{
				x: 0,
				y: 0,
				width: globalThis.screen?.availWidth ?? 1920,
				height: globalThis.screen?.availHeight ?? 1080,
				scaleFactor: globalThis.devicePixelRatio || 1,
			},
		);
		const otherWindows: SnapWindowRect[] = [];
		if (Array.isArray(allWindowsRes)) {
			const candidates = allWindowsRes.filter(
				(w) =>
					w &&
					w.label !== currentWin.label &&
					w.label.startsWith("subchar_window_"),
			);
			const rects = await Promise.all(
				candidates.map(async (w) => {
					try {
						if (!(await w.isVisible())) return null;
						const [wp, ws] = await Promise.all([
							w.outerPosition(),
							w.outerSize(),
						]);
						return ws.width > 0 && ws.height > 0
							? resolveOtherCharacterSnapRect(
									w.label,
									wp.x,
									wp.y,
									ws.width,
									ws.height,
								)
							: null;
					} catch {
						return null;
					}
				}),
			);
			for (const r of rects) {
				if (r) otherWindows.push(r);
			}
		}
		const charBounds = computeOpaqueImageBounds(
			target.querySelector("img"),
			workArea.scaleFactor,
		);
		saveCharacterBoundsForSnap(currentWin.label, charBounds);
		const snapThreshold = Math.max(1, Math.round(12 * workArea.scaleFactor));
		const snap = calculateCharacterSnap(
			pos.x,
			pos.y,
			size.width,
			size.height,
			charBounds,
			otherWindows,
			workArea,
			mainInitialPos,
			isCtrlPressed,
			snapThreshold,
		);
		if (snap.snapXType !== "None" || snap.snapYType !== "None") {
			await currentWin.setPosition(
				new PhysicalPosition(Math.round(snap.x), Math.round(snap.y)),
			);
		}
	} catch {}
}
