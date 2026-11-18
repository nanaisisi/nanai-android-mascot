/**
 * バルーンウィンドウのマウスドラッグおよびモバイルタッチ・ピンチズームジェスチャー管理モジュール
 */

import { Window } from "@tauri-apps/api/window";
import {
	emit,
	getCurrentWindowPosition,
	invoke,
	isTauriAvailable,
	startDraggingWindow,
} from "../../core/tauri-helper.js";
import { showBalloonContextMenu } from "../../ui/balloon-context-menu.js";
import { updateBalloonWindowScale } from "./scale.js";

const boundGestureBoxes = new WeakSet<object>();

export const BALLOON_RESET_HINT_TEXT = "Reset: Ctrl+Shift+F10";

/**
 * バルーンのキャラクター基準オフセット表示行を生成
 */
export function formatBalloonOffsetText(
	offsetX: number,
	offsetY: number,
): string {
	const roundedX = Math.round(offsetX);
	const roundedY = Math.round(offsetY);
	return `Offset: ${roundedX},${roundedY}`;
}

/**
 * `#coord-popup` へ2行構成のオフセット情報とリセットヒントを安全に描画
 */
export function renderBalloonCoordPopup(
	el: HTMLElement | null,
	offsetX: number,
	offsetY: number,
): void {
	if (!el) return;
	const line1Text = formatBalloonOffsetText(offsetX, offsetY);
	const line2Text = BALLOON_RESET_HINT_TEXT;

	if (
		typeof document !== "undefined" &&
		typeof document.createElement === "function" &&
		typeof el.replaceChildren === "function"
	) {
		const line1 = document.createElement("div");
		line1.className = "coord-popup-line";
		line1.textContent = line1Text;

		const line2 = document.createElement("div");
		line2.className = "coord-popup-hint";
		line2.textContent = line2Text;

		el.replaceChildren(line1, line2);
	} else if (
		typeof document !== "undefined" &&
		typeof document.createElement === "function" &&
		typeof el.appendChild === "function"
	) {
		el.textContent = "";
		const line1 = document.createElement("div");
		line1.className = "coord-popup-line";
		line1.textContent = line1Text;

		const line2 = document.createElement("div");
		line2.className = "coord-popup-hint";
		line2.textContent = line2Text;

		el.appendChild(line1);
		el.appendChild(line2);
	} else {
		el.textContent = `${line1Text}\n${line2Text}`;
	}
	if (el.style) {
		el.style.display = "block";
	}
}

export interface WindowGestureOptions {
	scopeId: number;
	getIsBalloonDontMove: () => boolean;
	getUserScale: () => number;
	getDpiScale: () => number;
	onUserScaleChange: (newScale: number) => void;
}

/**
 * バルーンウィンドウのマウス・タッチジェスチャーを設定
 * @param {HTMLElement | null} balloonBox
 * @param {WindowGestureOptions} options
 */
export function setupWindowGestures(
	balloonBox: HTMLElement | null,
	{
		scopeId,
		getIsBalloonDontMove,
		getUserScale,
		getDpiScale,
		onUserScaleChange,
	}: WindowGestureOptions,
) {
	if (!balloonBox || boundGestureBoxes.has(balloonBox)) return;
	boundGestureBoxes.add(balloonBox);

	let coordPopupEl: HTMLElement | null = null;
	let coordInterval: ReturnType<typeof setInterval> | null = null;
	let cachedCharWindow: Window | null = null;
	let dragStartBalloonPos: { x: number; y: number } | null = null;
	let isDragging = false;
	let isTouchDragging = false;
	let activeDragCleanup: (() => void) | null = null;

	async function getOwningCharacterPosition(): Promise<{
		x: number;
		y: number;
	} | null> {
		if (!isTauriAvailable()) return null;
		const charLabel = `subchar_window_${scopeId}`;
		try {
			if (!cachedCharWindow) {
				cachedCharWindow = await Window.getByLabel(charLabel);
			}
			if (!cachedCharWindow) return null;
			const pos = await cachedCharWindow.outerPosition();
			if (
				pos &&
				typeof pos.x === "number" &&
				typeof pos.y === "number" &&
				Number.isFinite(pos.x) &&
				Number.isFinite(pos.y)
			) {
				return { x: pos.x, y: pos.y };
			}
		} catch (_e) {
			cachedCharWindow = null;
		}
		return null;
	}

	async function updateCoordPopup() {
		if (!coordPopupEl && typeof document !== "undefined") {
			coordPopupEl = document.getElementById("coord-popup");
		}
		if (!coordPopupEl) return;
		try {
			const [pos, charPos] = await Promise.all([
				getCurrentWindowPosition(),
				getOwningCharacterPosition(),
			]);
			if (!isDragging && !isTouchDragging) return;
			if (!pos) return;

			let offsetX: number;
			let offsetY: number;
			if (charPos) {
				offsetX = pos.x - charPos.x;
				offsetY = pos.y - charPos.y;
			} else {
				if (!dragStartBalloonPos) {
					dragStartBalloonPos = pos;
				}
				offsetX = pos.x - dragStartBalloonPos.x;
				offsetY = pos.y - dragStartBalloonPos.y;
			}
			renderBalloonCoordPopup(coordPopupEl, offsetX, offsetY);
		} catch (_e) {}
	}

	function hideCoordPopup() {
		if (coordPopupEl?.style) {
			coordPopupEl.style.display = "none";
		}
	}

	function stopCoordInterval() {
		if (coordInterval !== null) {
			clearInterval(coordInterval);
			coordInterval = null;
		}
	}

	function startCoordInterval() {
		stopCoordInterval();
		coordInterval = setInterval(() => {
			if (isDragging || isTouchDragging) {
				void updateCoordPopup();
			} else {
				stopCoordInterval();
			}
		}, 50);
	}

	function finishMouseDrag() {
		const wasDragging = isDragging;
		isDragging = false;
		dragStartBalloonPos = null;
		stopCoordInterval();
		activeDragCleanup?.();
		activeDragCleanup = null;
		hideCoordPopup();
		if (wasDragging && isTauriAvailable()) {
			void invoke("save_balloon_offset_from_position", { scopeId });
		}
	}

	// バルーン本体のクリックでスキップまたは改ページ通知
	balloonBox.addEventListener("click", () => {
		void emit("balloon-clicked", { scopeId });
	});

	// バルーン右クリックで WebView2 デフォルトメニューを阻止しバルーンコンテキストメニューを表示
	let lastContextMenuEvent: Event | null = null;
	const onContextMenu = (e?: MouseEvent) => {
		const target = e?.target as HTMLElement | null | undefined;
		const isInput =
			target &&
			(target.tagName === "INPUT" ||
				target.tagName === "TEXTAREA" ||
				target.isContentEditable);
		if (isInput) return;

		e?.preventDefault?.();
		e?.stopPropagation?.();

		if (e && lastContextMenuEvent === e) {
			return false;
		}
		if (e) {
			lastContextMenuEvent = e;
		}

		void showBalloonContextMenu({
			x: e?.clientX ?? 100,
			y: e?.clientY ?? 100,
			screenX: e?.screenX,
			screenY: e?.screenY,
			scopeId,
		});
		return false;
	};
	balloonBox.addEventListener(
		"contextmenu",
		onContextMenu as EventListener,
		true,
	);
	if (typeof document !== "undefined") {
		document.addEventListener(
			"contextmenu",
			onContextMenu as EventListener,
			true,
		);
	}

	// ドラッグ移動 (Tauri v2 startDragging)
	balloonBox.addEventListener("mousedown", (e: MouseEvent) => {
		if (e.button === 0 && !getIsBalloonDontMove()) {
			isDragging = true;
			dragStartBalloonPos = null;
			void startDraggingWindow();
			void updateCoordPopup();
			startCoordInterval();
			const onMove = () => {
				if (isDragging) void updateCoordPopup();
			};
			const winTarget =
				typeof window !== "undefined" &&
				typeof window.addEventListener === "function"
					? window
					: typeof document !== "undefined" &&
							typeof document.addEventListener === "function"
						? document
						: null;
			const onUp = () => {
				finishMouseDrag();
			};
			activeDragCleanup?.();
			activeDragCleanup = () => {
				winTarget?.removeEventListener?.("mousemove", onMove);
				winTarget?.removeEventListener?.("mouseup", onUp);
			};
			winTarget?.addEventListener?.("mousemove", onMove);
			winTarget?.addEventListener?.("mouseup", onUp);
		}
	});

	balloonBox.addEventListener("mouseup", () => {
		if (!getIsBalloonDontMove()) {
			if (isDragging) {
				finishMouseDrag();
			} else {
				stopCoordInterval();
				hideCoordPopup();
				if (isTauriAvailable()) {
					void invoke("save_balloon_offset_from_position", { scopeId });
				}
			}
		}
	});

	// モバイル/タッチ操作対応 (Slot-10 Cycle 3)
	let touchStartDistance = 0;
	let lastTouchTapTime = 0;
	let pinchInitialScale = 1;

	balloonBox.addEventListener(
		"touchstart",
		(e: TouchEvent) => {
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
					dragStartBalloonPos = null;
					void startDraggingWindow();
					void updateCoordPopup();
					startCoordInterval();
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
		(e: TouchEvent) => {
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
		(e: TouchEvent) => {
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
					dragStartBalloonPos = null;
					stopCoordInterval();
					hideCoordPopup();
					if (isTauriAvailable()) {
						void invoke("save_balloon_offset_from_position", { scopeId });
					}
				}
			}
		},
		{ passive: true },
	);
}
