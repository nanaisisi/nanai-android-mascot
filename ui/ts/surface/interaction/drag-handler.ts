import { isTauriAvailable } from "../../core/tauri-helper.js";
import {
	DOCK_LEFT_THRESHOLD,
	DOCK_RESTORE_OFFSET,
	DOCK_RIGHT_THRESHOLD,
	DRAG_MIN_MOVE,
	DRAG_PADDING,
	LONG_PRESS_DELAY,
	STROKE_THRESHOLD,
} from "./drag/constants.js";
import {
	applyDockingSnap,
	isElementDocked,
	restoreFromDocking,
} from "./drag/docking.js";
import {
	calculateClampedCoordinates,
	clampPosition,
	createNativeDragSession,
} from "./drag/drag-motion.js";
import { createLongPressController } from "./drag/long-press.js";
import { createStrokeTracker } from "./drag/stroke.js";
import { isPixelTransparent } from "./transparency.js";

// Re-export submodules for direct usage
export {
	applyDockingSnap,
	calculateClampedCoordinates,
	clampPosition,
	createLongPressController,
	createNativeDragSession,
	createStrokeTracker,
	DOCK_LEFT_THRESHOLD,
	DOCK_RESTORE_OFFSET,
	DOCK_RIGHT_THRESHOLD,
	DRAG_MIN_MOVE,
	DRAG_PADDING,
	isElementDocked,
	LONG_PRESS_DELAY,
	restoreFromDocking,
	STROKE_THRESHOLD,
};

/**
 * ゴースト本体のドラッグ移動、スナップ退避、および部位撫で（Stroke）判定のセットアップ
 *
 * @param {HTMLElement} target
 * @param {(clientX: number, clientY: number, rect: DOMRect) => void} [onGhostClick]
 * @param {(clientX: number, clientY: number, rect: DOMRect) => void} [onGhostStroke]
 * @param {object} [options={}]
 * @param {(clientX: number, clientY: number, rect: DOMRect, button: number, device: string) => void} [options.onGhostMouseDown]
 * @param {(clientX: number, clientY: number, rect: DOMRect, button: number, device: string) => void} [options.onGhostMouseUp]
 * @param {(clientX: number, clientY: number, rect: DOMRect) => void} [options.onGhostDragStart]
 * @param {(clientX: number, clientY: number, rect: DOMRect) => void} [options.onGhostDragEnd]
 * @param {object} [context={}]
 * @param {() => void} [context.toggleMenu]
 * @param {(newX: number, newY: number) => void} [context.updateFollowPosition]
 * @param {(img: HTMLElement, clientX: number, clientY: number) => boolean} [context.isPixelTransparent]
 * @returns {{ isInteractingOrDragging: () => boolean, cleanup: () => void }}
 */
export function setupGhostDragging(
	target,
	onGhostClick,
	onGhostStroke,
	options = {},
	context = {},
) {
	if (!target) {
		return {
			isInteractingOrDragging: () => false,
			cleanup: () => {},
		};
	}

	const { onGhostMouseDown, onGhostMouseUp, onGhostDragStart, onGhostDragEnd } =
		options;

	let isInteracting = false;
	let isDragging = false;
	let startX = 0;
	let startY = 0;
	let lastX = 0;
	let lastY = 0;
	let initialLeft = 0;
	let initialTop = 0;
	let hasMoved = false;
	let rafPending = false;

	const nativeDrag = createNativeDragSession();

	const longPress = createLongPressController({
		delay: LONG_PRESS_DELAY,
		onTrigger: () => {
			context.toggleMenu?.();
		},
	});

	const strokeTracker = createStrokeTracker({
		threshold: STROKE_THRESHOLD,
		onStroke: (clientX, clientY) => {
			if (onGhostStroke) {
				const rect = target.getBoundingClientRect();
				onGhostStroke(clientX, clientY, rect);
			}
		},
	});

	const checkTransparency = context.isPixelTransparent || isPixelTransparent;

	const onPointerDown = (e) => {
		if (e.button !== undefined && e.button !== 0) return;

		// ブラウザデフォルトの画像ドラッグやテキスト選択を防止
		if (e.cancelable) {
			e.preventDefault();
		}

		isInteracting = true;
		isDragging = false;
		hasMoved = false;
		nativeDrag.reset();
		strokeTracker.reset();
		longPress.reset();

		const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
		const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? 0;

		// 透明ピクセルの場合はドラッグやインタラクションを開始しない（クリックスルーの補助）
		const img = target.querySelector("img");
		if (img && checkTransparency(img, clientX, clientY)) {
			return;
		}

		// Tauri のネイティブドラッグは、移動後ではなく押下イベント中に開始する必要がある。
		if (nativeDrag.canStartNativeDrag(e.type)) {
			nativeDrag.startNativeDrag(() => isInteracting);
		}

		startX = clientX;
		startY = clientY;
		lastX = clientX;
		lastY = clientY;

		const rect = target.getBoundingClientRect();
		initialLeft = rect.left + rect.width / 2;
		initialTop = rect.top + rect.height / 2;

		if (onGhostMouseDown) {
			const button = e.button !== undefined ? e.button : 0;
			const device = e.touches ? "touch" : "mouse";
			onGhostMouseDown(clientX, clientY, rect, button, device);
		}

		// 長押しタイマー開始
		longPress.start(
			() => isInteracting && !hasMoved && !strokeTracker.isTriggered(),
		);
	};

	const onPointerMove = (e) => {
		if (!isInteracting) return;

		const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
		const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? 0;

		const deltaX = clientX - startX;
		const deltaY = clientY - startY;
		const stepDist = Math.hypot(clientX - lastX, clientY - lastY);
		lastX = clientX;
		lastY = clientY;

		// 初期の遊び（微小な手振れ）を超えたら動作判定開始
		if (!hasMoved && Math.hypot(deltaX, deltaY) > DRAG_MIN_MOVE) {
			hasMoved = true;
			longPress.cancel();
		}

		// ドッキング中でない場合、ドラッグ移動または撫で判定
		const isDocked = isElementDocked(target);

		if (!isDocked && !isDragging) {
			// 当たり部位内での往復運動か、一方向への大きなドラッグかを判別
			strokeTracker.addDistance(stepDist, clientX, clientY);
		}

		// 撫でが発動していなければ通常のドラッグ移動を行う
		if (!strokeTracker.isTriggered() && hasMoved) {
			if (!isDragging) {
				isDragging = true;
				target.classList.add("is-dragging");
				if (onGhostDragStart) {
					const rect = target.getBoundingClientRect();
					onGhostDragStart(clientX, clientY, rect);
				}
			}

			// デスクトップ環境（Windows等）の場合はネイティブウィンドウ自体を移動
			if (nativeDrag.hasStarted()) {
				nativeDrag.moveNativeWindow(clientX - startX, clientY - startY);
				return;
			}

			const { x: newX, y: newY } = calculateClampedCoordinates(
				initialLeft,
				initialTop,
				deltaX,
				deltaY,
				DRAG_PADDING,
			);

			if (!rafPending) {
				rafPending = true;
				requestAnimationFrame(() => {
					rafPending = false;
					if (!isInteracting && !isDragging) return;
					target.style.left = `${newX}px`;
					target.style.top = `${newY}px`;
					target.style.transform = "translate(-50%, -50%)";

					// バルーンが存在する場合、設定された相対オフセットを維持してキャラクターに追従
					context.updateFollowPosition?.(newX, newY);
				});
			}
		}
	};

	const onPointerUp = (e) => {
		if (!isInteracting) return;
		const wasDragging = isDragging;
		isInteracting = false;
		rafPending = false;
		target.classList.remove("is-dragging");

		longPress.cancel();

		const clientX = e.clientX ?? startX;
		const clientY = e.clientY ?? startY;
		const rect = target.getBoundingClientRect();

		if (wasDragging && onGhostDragEnd) {
			onGhostDragEnd(clientX, clientY, rect);
		}

		if (onGhostMouseUp) {
			const button = e.button !== undefined ? e.button : 0;
			const device = e.changedTouches ? "touch" : "mouse";
			onGhostMouseUp(clientX, clientY, rect, button, device);
		}

		// 長押し発火後や撫で判定が発火していた場合はタップやドラッグ確定を行わない
		if (longPress.isTriggered() || strokeTracker.isTriggered()) {
			return;
		}

		if (nativeDrag.hasStarted()) {
			if (!hasMoved && onGhostClick) {
				const clickX = e.clientX ?? startX;
				const clickY = e.clientY ?? startY;
				const currentRect = target.getBoundingClientRect();
				onGhostClick(clickX, clickY, currentRect);
			}
			target.classList.remove("is-dragging");
			return;
		}

		if (isDragging) {
			// 画面端スナップ（ドッキング退避判定: 非Tauri環境(Web/モバイル)または明示的なオプション指定時）
			if (!isTauriAvailable() || options.enableDocking) {
				applyDockingSnap(target, globalThis.innerWidth);
			} else {
				target.classList.remove("is-docked-left", "is-docked-right");
			}
		} else {
			// ドッキング中のタップで復帰
			if (restoreFromDocking(target, globalThis.innerWidth)) {
				return;
			}

			// 通常タップ（Click）判定
			if (onGhostClick) {
				const clickX = e.clientX ?? startX;
				const clickY = e.clientY ?? startY;
				const currentRect = target.getBoundingClientRect();
				onGhostClick(clickX, clickY, currentRect);
			}
		}
	};

	target.addEventListener("mousedown", onPointerDown);
	globalThis.addEventListener("mousemove", onPointerMove);
	globalThis.addEventListener("mouseup", onPointerUp);

	target.addEventListener("touchstart", onPointerDown, { passive: true });
	globalThis.addEventListener("touchmove", onPointerMove, { passive: true });
	globalThis.addEventListener("touchend", onPointerUp);

	const cleanup = () => {
		longPress.cleanup();
		target.removeEventListener("mousedown", onPointerDown);
		globalThis.removeEventListener("mousemove", onPointerMove);
		globalThis.removeEventListener("mouseup", onPointerUp);

		target.removeEventListener("touchstart", onPointerDown);
		globalThis.removeEventListener("touchmove", onPointerMove);
		globalThis.removeEventListener("touchend", onPointerUp);
	};

	return {
		isInteractingOrDragging: () => isInteracting || isDragging,
		cleanup,
	};
}
