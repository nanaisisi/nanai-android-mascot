import {
	availableMonitors,
	currentMonitor,
	getAllWindows,
	getCurrentWindow,
	primaryMonitor,
} from "@tauri-apps/api/window";
import {
	getCurrentWindowPosition,
	isTauriAvailable,
	moveCurrentWindowBy,
} from "../../../core/tauri-helper.js";
import { DRAG_PADDING } from "./constants.js";
import { getMainInitialPosition } from "./drag-pointer-up.js";
import {
	type CharacterSnapBounds,
	calculateCharacterSnap,
	computeOpaqueImageBounds,
	formatSnapTooltipText,
	type MonitorLike,
	pickMonitorWorkArea,
	resolveOtherCharacterSnapRect,
	type SnapWindowRect,
} from "./snap.js";

/**
 * 値を指定範囲内にクランプする
 *
 * @param {number} val
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function clampPosition(val: number, min: number, max: number) {
	return Math.max(min, Math.min(max, val));
}

/**
 * 画面内パディングを考慮した要素の制限座標を計算
 *
 * @param {number} initialLeft
 * @param {number} initialTop
 * @param {number} deltaX
 * @param {number} deltaY
 * @param {number} [padding=DRAG_PADDING]
 * @param {number} [innerWidth=globalThis.innerWidth]
 * @param {number} [innerHeight=globalThis.innerHeight]
 * @returns {{ x: number, y: number }}
 */
export function calculateClampedCoordinates(
	initialLeft: number,
	initialTop: number,
	deltaX: number,
	deltaY: number,
	padding = DRAG_PADDING,
	innerWidth = globalThis.innerWidth,
	innerHeight = globalThis.innerHeight,
) {
	const rawX = initialLeft + deltaX;
	const rawY = initialTop + deltaY;

	const x = clampPosition(rawX, padding, innerWidth - padding);
	const y = clampPosition(rawY, padding, innerHeight - padding);

	return { x, y };
}

/**
 * デスクトップ環境におけるネイティブウィンドウドラッグ管理セッション
 *
 * @returns {{
 *   canStartNativeDrag: (eventType: string) => boolean,
 *   startNativeDrag: (isInteracting: () => boolean) => boolean,
 *   moveNativeWindow: (deltaX: number, deltaY: number) => void,
 *   hasStarted: () => boolean,
 *   reset: () => void
 * }}
 */
export function createNativeDragSession() {
	let nativeDragStarted = false;
	let nativeWindowOrigin: { x: number; y: number } | null = null;

	const canStartNativeDrag = (eventType: string) => {
		return (
			eventType === "mousedown" &&
			isTauriAvailable() &&
			!navigator.userAgent.includes("Android")
		);
	};

	let snapCtx: {
		winWidth: number;
		winHeight: number;
		monitors: MonitorLike[];
		otherWindows: SnapWindowRect[];
		charBounds: CharacterSnapBounds | null;
	} | null = null;

	const loadMainSnapContext = async () => {
		try {
			const currentWin = getCurrentWindow();
			const [size, availRes, allWindowsRes] = await Promise.all([
				currentWin.outerSize().catch(() => null),
				availableMonitors().catch(() => null),
				getAllWindows().catch(() => null),
			]);
			const monitors: MonitorLike[] = Array.isArray(availRes)
				? availRes.filter((m): m is NonNullable<typeof m> => Boolean(m))
				: [];
			if (monitors.length === 0) {
				const mon = (await currentMonitor()) ?? (await primaryMonitor());
				if (mon) monitors.push(mon);
			}
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
			const img =
				typeof document !== "undefined"
					? (document.querySelector(
							"#ghost-img, .ghost-container img",
						) as HTMLImageElement | null)
					: null;
			const scaleFactor =
				monitors[0]?.scaleFactor ?? (globalThis.devicePixelRatio || 1);
			snapCtx = {
				winWidth: size?.width ?? 200,
				winHeight: size?.height ?? 400,
				monitors,
				otherWindows,
				charBounds: computeOpaqueImageBounds(img, scaleFactor),
			};
		} catch {}
	};

	const startNativeDrag = (isInteracting: () => unknown) => {
		nativeDragStarted = true;
		void loadMainSnapContext();
		void getCurrentWindowPosition().then((position) => {
			if (!isInteracting || isInteracting()) {
				nativeWindowOrigin = position;
			}
		});
		return true;
	};

	const moveNativeWindow = (deltaX: number, deltaY: number) => {
		if (nativeDragStarted && nativeWindowOrigin) {
			const rawX = nativeWindowOrigin.x + deltaX;
			const rawY = nativeWindowOrigin.y + deltaY;
			let targetX = rawX;
			let targetY = rawY;
			let snapXType = "None";
			let snapYType = "None";
			if (snapCtx) {
				const workArea = pickMonitorWorkArea(
					snapCtx.monitors,
					rawX,
					rawY,
					snapCtx.winWidth,
					snapCtx.winHeight,
					{
						x: 0,
						y: 0,
						width: globalThis.screen?.availWidth ?? 1920,
						height: globalThis.screen?.availHeight ?? 1080,
						scaleFactor: globalThis.devicePixelRatio || 1,
					},
				);
				const threshold = Math.max(1, Math.round(12 * workArea.scaleFactor));
				const snap = calculateCharacterSnap(
					rawX,
					rawY,
					snapCtx.winWidth,
					snapCtx.winHeight,
					snapCtx.charBounds,
					snapCtx.otherWindows,
					workArea,
					getMainInitialPosition(),
					false,
					threshold,
				);
				targetX = snap.x;
				targetY = snap.y;
				snapXType = snap.snapXType;
				snapYType = snap.snapYType;
			}
			void moveCurrentWindowBy(
				targetX - nativeWindowOrigin.x,
				targetY - nativeWindowOrigin.y,
				nativeWindowOrigin,
			);
			const popup =
				typeof document !== "undefined"
					? document.getElementById("coord-popup")
					: null;
			if (popup) {
				popup.textContent = formatSnapTooltipText(
					targetX,
					targetY,
					snapXType,
					snapYType,
				);
				popup.style.display = "block";
			}
		}
	};

	const reset = () => {
		nativeDragStarted = false;
		nativeWindowOrigin = null;
		snapCtx = null;
		const popup =
			typeof document !== "undefined"
				? document.getElementById("coord-popup")
				: null;
		if (popup) {
			popup.style.display = "none";
		}
	};

	return {
		canStartNativeDrag,
		startNativeDrag,
		moveNativeWindow,
		hasStarted: () => nativeDragStarted,
		reset,
	};
}
