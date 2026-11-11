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
import { handleGhostPointerUp } from "./drag/drag-pointer-up.js";
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
 */
export function setupGhostDragging(
	target: HTMLElement,
	onGhostClick: unknown,
	onGhostStroke: unknown,
	options: unknown = {},
	context: unknown = {},
) {
	if (!target) {
		return {
			isInteractingOrDragging: () => false,
			cleanup: () => {},
		};
	}

	const { onGhostMouseDown, onGhostMouseUp, onGhostDragStart, onGhostDragEnd } =
		options;

	const dragInternalState = {
		isInteracting: false,
		isDragging: false,
		startX: 0,
		startY: 0,
		hasMoved: false,
	};
	let lastX = 0;
	let lastY = 0;
	let initialLeft = 0;
	let initialTop = 0;
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
		onStroke: (clientX: unknown, clientY: unknown) => {
			if (onGhostStroke) {
				const rect = target.getBoundingClientRect();
				(onGhostStroke as unknown)(clientX, clientY, rect);
			}
		},
	});

	const checkTransparency = context.isPixelTransparent || isPixelTransparent;

	const onPointerDown = (e: unknown) => {
		if (e.button !== undefined && e.button !== 0) return;

		if (e.cancelable) {
			e.preventDefault();
		}

		dragInternalState.isInteracting = true;
		dragInternalState.isDragging = false;
		dragInternalState.hasMoved = false;
		nativeDrag.reset();
		strokeTracker.reset();
		longPress.reset();

		const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
		const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? 0;

		const img = target.querySelector("img");
		if (img && checkTransparency(img, clientX, clientY)) {
			return;
		}

		if (nativeDrag.canStartNativeDrag(e.type)) {
			nativeDrag.startNativeDrag(() => dragInternalState.isInteracting);
		}

		dragInternalState.startX = clientX;
		dragInternalState.startY = clientY;
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

		longPress.start(
			() =>
				dragInternalState.isInteracting &&
				!dragInternalState.hasMoved &&
				!strokeTracker.isTriggered(),
		);
	};

	const onPointerMove = (e: unknown) => {
		if (!dragInternalState.isInteracting) return;

		const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
		const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? 0;

		const deltaX = clientX - dragInternalState.startX;
		const deltaY = clientY - dragInternalState.startY;
		const stepDist = Math.hypot(clientX - lastX, clientY - lastY);
		lastX = clientX;
		lastY = clientY;

		if (
			!dragInternalState.hasMoved &&
			Math.hypot(deltaX, deltaY) > DRAG_MIN_MOVE
		) {
			dragInternalState.hasMoved = true;
			longPress.cancel();
		}

		const isDocked = isElementDocked(target);

		if (!isDocked && !dragInternalState.isDragging) {
			strokeTracker.addDistance(stepDist, clientX, clientY);
		}

		if (!strokeTracker.isTriggered() && dragInternalState.hasMoved) {
			if (!dragInternalState.isDragging) {
				dragInternalState.isDragging = true;
				target.classList.add("is-dragging");
				if (onGhostDragStart) {
					const rect = target.getBoundingClientRect();
					onGhostDragStart(clientX, clientY, rect);
				}
			}

			if (nativeDrag.hasStarted()) {
				nativeDrag.moveNativeWindow(
					clientX - dragInternalState.startX,
					clientY - dragInternalState.startY,
				);
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
					if (!dragInternalState.isInteracting && !dragInternalState.isDragging)
						return;
					target.style.left = `${newX}px`;
					target.style.top = `${newY}px`;
					target.style.transform = "translate(-50%, -50%)";

					context.updateFollowPosition?.(newX, newY);
				});
			}
		}
	};

	const onPointerUp = (e: unknown) => {
		rafPending = false;
		handleGhostPointerUp(
			e,
			dragInternalState,
			target,
			longPress,
			strokeTracker,
			nativeDrag,
			options,
			onGhostClick,
			onGhostDragEnd,
			onGhostMouseUp,
		);
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
		isInteractingOrDragging: () =>
			dragInternalState.isInteracting || dragInternalState.isDragging,
		cleanup,
	};
}
