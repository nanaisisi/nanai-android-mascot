/**
 * バルーンウィンドウのマウスドラッグおよびモバイルタッチ・ピンチズームジェスチャー管理モジュール
 */

import { emit, invoke, startDraggingWindow } from "../../core/tauri-helper.js";
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
	balloonBox,
	{
		scopeId,
		getIsBalloonDontMove,
		getUserScale,
		getDpiScale,
		onUserScaleChange,
	},
) {
	if (!balloonBox) return;

	// バルーン本体のクリックでスキップまたは改ページ通知
	balloonBox.addEventListener("click", () => {
		void emit("balloon-clicked", { scopeId });
	});

	// ドラッグ移動 (Tauri v2 startDragging)
	balloonBox.addEventListener("mousedown", (e) => {
		if (e.button === 0 && !getIsBalloonDontMove()) {
			void startDraggingWindow();
		}
	});

	balloonBox.addEventListener("mouseup", () => {
		if (!getIsBalloonDontMove()) {
			void invoke("save_balloon_offset_from_position", { scopeId });
		}
	});

	// モバイル/タッチ操作対応 (Slot-10 Cycle 3)
	let touchStartDistance = 0;
	let lastTouchTapTime = 0;
	let isTouchDragging = false;

	balloonBox.addEventListener(
		"touchstart",
		(e) => {
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
			}
		},
		{ passive: true },
	);

	balloonBox.addEventListener(
		"touchmove",
		(e) => {
			if (e.touches.length === 2 && touchStartDistance > 0) {
				const dx = e.touches[0].clientX - e.touches[1].clientX;
				const dy = e.touches[0].clientY - e.touches[1].clientY;
				const currentDistance = Math.hypot(dx, dy);
				const ratio = currentDistance / touchStartDistance;
				if (Math.abs(ratio - 1) > 0.15) {
					const currentScale = getUserScale();
					const nextScale = Math.min(2.0, Math.max(0.5, currentScale * ratio));
					const roundedScale = +nextScale.toFixed(2);
					onUserScaleChange(roundedScale);
					touchStartDistance = currentDistance;
					updateBalloonWindowScale(balloonBox, roundedScale, getDpiScale());
				}
			}
		},
		{ passive: true },
	);

	balloonBox.addEventListener(
		"touchend",
		(e) => {
			if (e.touches.length === 0) {
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
