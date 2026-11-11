/**
 * バルーンウィンドウのマウスドラッグおよびモバイルタッチ・ピンチズームジェスチャー管理モジュール
 */

import {
	emit,
	getCurrentWindowPosition,
	invoke,
	startDraggingWindow,
} from "../../core/tauri-helper.js";
import { updateBalloonWindowScale } from "./scale.js";

/**
 * バルーンウィンドウのマウス・タッチジェスチャーを設定
 * @param {HTMLElement | null} balloonBox
 * @param {object} options
 * @param {number} options.scopeId
 * @param {() => boolean} options.getIsBalloonDontMove
 * @param {() => number} options.getUserScale
 * @param {() => number} options.getDpiScale
 * @param {(newScale: number) => void} options.onUserScaleChange
 */
export function setupWindowGestures(
	balloonBox: HTMLElement | null,
	{
		scopeId,
		getIsBalloonDontMove,
		getUserScale,
		getDpiScale,
		onUserScaleChange,
	}: unknown,
) {
	if (!balloonBox) return;

	let coordPopupEl: HTMLElement | null = null;
	async function updateCoordPopup() {
		if (!coordPopupEl) {
			coordPopupEl = document.getElementById("coord-popup");
		}
		if (coordPopupEl) {
			try {
				const pos = await getCurrentWindowPosition();
				if (pos) {
					coordPopupEl.textContent = `X: ${pos.x}, Y: ${pos.y}`;
					coordPopupEl.style.display = "block";
				}
			} catch (_e) {}
		}
	}
	function hideCoordPopup() {
		if (coordPopupEl) {
			coordPopupEl.style.display = "none";
		}
	}

	// バルーン本体のクリックでスキップまたは改ページ通知
	balloonBox.addEventListener("click", () => {
		void emit("balloon-clicked", { scopeId });
	});

	// ドラッグ移動 (Tauri v2 startDragging)
	let isDragging = false;
	balloonBox.addEventListener("mousedown", (e: { button: number }) => {
		if (e.button === 0 && !getIsBalloonDontMove()) {
			isDragging = true;
			void startDraggingWindow();
			void updateCoordPopup();
			const onMove = () => {
				if (isDragging) void updateCoordPopup();
			};
			const winTarget =
				typeof window !== "undefined" &&
				typeof window.addEventListener === "function"
					? window
					: typeof document !== "undefined"
						? document
						: globalThis;
			const onUp = () => {
				isDragging = false;
				hideCoordPopup();
				winTarget.removeEventListener("mousemove", onMove);
				winTarget.removeEventListener("mouseup", onUp);
			};
			winTarget.addEventListener("mousemove", onMove);
			winTarget.addEventListener("mouseup", onUp);
		}
	});

	balloonBox.addEventListener("mouseup", () => {
		if (!getIsBalloonDontMove()) {
			hideCoordPopup();
			void invoke("save_balloon_offset_from_position", { scopeId });
		}
	});

	// モバイル/タッチ操作対応 (Slot-10 Cycle 3)
	let touchStartDistance = 0;
	let lastTouchTapTime = 0;
	let isTouchDragging = false;
	let pinchInitialScale = 1;

	balloonBox.addEventListener(
		"touchstart",
		(e: { touches: string | unknown[] }) => {
			if (e.touches.length === 1) {
				const now = Date.now();
				// ダブルタップでバルーン倍率切替 (100% <-> 125%)
				if (now - lastTouchTapTime < 300) {
					const currentScale = getUserScale();
					const newScale = currentScale === 1 ? 1.25 : 1;
					onUserScaleChange(newScale);
					const currentDpiScale = getDpiScale();
					updateBalloonWindowScale(balloonBox, newScale, currentDpiScale);
					void emit("balloon-scale-changed", {
						userScale: newScale,
						dpiScale: currentDpiScale,
						finalScale: +(newScale * currentDpiScale).toFixed(4),
					});
					void emit("request-balloon-scale-change", {
						userScale: newScale,
					});
					lastTouchTapTime = 0;
					return;
				}
				lastTouchTapTime = now;
				if (!getIsBalloonDontMove()) {
					isTouchDragging = true;
					void startDraggingWindow();
				}
			} else if (e.touches.length === 2) {
				// ピンチ操作の初期距離記録
				const dx = e.touches[0].clientX - e.touches[1].clientX;
				const dy = e.touches[0].clientY - e.touches[1].clientY;
				touchStartDistance = Math.hypot(dx, dy);
				pinchInitialScale = getUserScale();
			}
		},
		{ passive: true },
	);

	balloonBox.addEventListener(
		"touchmove",
		(e: { touches: string | unknown[] }) => {
			if (e.touches.length === 2 && touchStartDistance > 0) {
				const dx = e.touches[0].clientX - e.touches[1].clientX;
				const dy = e.touches[0].clientY - e.touches[1].clientY;
				const currentDistance = Math.hypot(dx, dy);
				const ratio = currentDistance / touchStartDistance;
				if (Math.abs(ratio - 1) > 0.05) {
					const nextScale = Math.min(
						2.0,
						Math.max(0.5, pinchInitialScale * ratio),
					);
					const roundedScale = +nextScale.toFixed(2);
					onUserScaleChange(roundedScale);
					updateBalloonWindowScale(balloonBox, roundedScale, getDpiScale());
				}
			}
		},
		{ passive: true },
	);

	balloonBox.addEventListener(
		"touchend",
		(e: { touches: string | unknown[] }) => {
			if (e.touches.length === 0) {
				if (touchStartDistance > 0) {
					const finalScale = getUserScale();
					const currentDpiScale = getDpiScale();
					void emit("balloon-scale-changed", {
						userScale: finalScale,
						dpiScale: currentDpiScale,
						finalScale: +(finalScale * currentDpiScale).toFixed(4),
					});
					void emit("request-balloon-scale-change", {
						userScale: finalScale,
					});
				}
				touchStartDistance = 0;
				if (isTouchDragging) {
					isTouchDragging = false;
					void invoke("save_balloon_offset_from_position", { scopeId });
				}
			}
		},
		{ passive: true },
	);
}
