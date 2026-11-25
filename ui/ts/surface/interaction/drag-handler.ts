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
import {
	createClickTracker,
	handleGhostPointerUp,
	normalizePointerDevice,
} from "./drag/drag-pointer-up.js";
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

export interface DragOptions {
	onGhostMouseDown?: (
		x: number,
		y: number,
		rect: unknown,
		button: number,
		device: string,
	) => unknown;
	onGhostMouseUp?: (
		x: number,
		y: number,
		rect: unknown,
		button: number,
		device: string,
	) => unknown;
	onGhostDragStart?: (x: number, y: number, rect: unknown) => unknown;
	onGhostDragEnd?: (x: number, y: number, rect: unknown) => unknown;
	isNoDragAtPoint?: (x: number, y: number, rect: unknown) => boolean;
	onGhostMouseEx?: (
		type: "down" | "up",
		x: number,
		y: number,
		rect: unknown,
		button: string | number,
		device: string,
	) => void;
	onGhostMouseClickEx?: (
		x: number,
		y: number,
		rect: unknown,
		button: string | number,
		device: string,
		isDouble: boolean,
	) => void;
	onGhostMultipleClick?: (
		x: number,
		y: number,
		rect: unknown,
		count: number,
		button: number | string,
		device: string,
		isEx: boolean,
	) => void;
	onGhostGesture?: (
		startX: number,
		startY: number,
		endX: number,
		endY: number,
		direction: string,
		rect: unknown,
	) => void;
	enableDocking?: boolean;
	[key: string]: unknown;
}

interface DragContext {
	toggleMenu?: () => void;
	isPixelTransparent?: (img: HTMLElement, x: number, y: number) => boolean;
	updateFollowPosition?: (x: number, y: number) => void;
	[key: string]: unknown;
}

type PointerEventEx = Event & {
	button?: number;
	clientX?: number;
	clientY?: number;
	pointerType?: string;
	changedTouches?: Array<{
		clientX?: number;
		clientY?: number;
		[key: string]: unknown;
	}>;
	touches?: Array<{
		clientX?: number;
		clientY?: number;
		[key: string]: unknown;
	}>;
	type?: string;
	[key: string]: unknown;
};

type ExtendedButtonName = "middle" | "xbutton1" | "xbutton2";

const GESTURE_DIRECTIONS = [
	"right",
	"right_down",
	"down",
	"left_down",
	"left",
	"left_up",
	"up",
	"right_up",
] as const;

function getExtendedButtonName(
	button: number | undefined,
): ExtendedButtonName | null {
	switch (button) {
		case 1:
			return "middle";
		case 3:
			return "xbutton1";
		case 4:
			return "xbutton2";
		default:
			return null;
	}
}

function detectGestureDirection(dx: number, dy: number): string {
	const angle = Math.atan2(dy, dx) * (180 / Math.PI);
	const normalized = (((angle + 22.5) % 360) + 360) % 360;
	const sector = Math.floor(normalized / 45) % GESTURE_DIRECTIONS.length;
	return GESTURE_DIRECTIONS[sector] ?? "right";
}

/**
 * ゴースト本体のドラッグ移動、スナップ退避、および部位撫で（Stroke）判定のセットアップ
 */
export function setupGhostDragging(
	target: HTMLElement,
	onGhostClick: unknown,
	onGhostStroke: unknown,
	options: DragOptions = {},
	context: DragContext = {},
) {
	if (!target) {
		return {
			isInteractingOrDragging: () => false,
			cleanup: () => {},
		};
	}

	const {
		onGhostMouseDown,
		onGhostMouseUp,
		onGhostDragStart,
		onGhostDragEnd,
		isNoDragAtPoint,
		onGhostMouseEx,
		onGhostMouseClickEx,
		onGhostMultipleClick,
		onGhostGesture,
	} = options;

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
	let lastTouchTimestamp = 0;

	const leftClickTracker = createClickTracker(350, 10);
	const exClickTracker = createClickTracker(350, 10);

	let activeExPress: {
		buttonName: ExtendedButtonName;
		startX: number;
		startY: number;
		device: string;
		hasMoved: boolean;
	} | null = null;

	const rightDragState = {
		active: false,
		startX: 0,
		startY: 0,
	};

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
			if (typeof onGhostStroke === "function") {
				const rect = target.getBoundingClientRect();
				(onGhostStroke as (x: unknown, y: unknown, rect: DOMRect) => unknown)(
					clientX,
					clientY,
					rect,
				);
			}
		},
	}) as {
		reset: () => void;
		addDistance: (dist: number, x: number, y: number) => void;
		isTriggered: () => boolean;
		[key: string]: unknown;
	};

	const checkTransparency = context.isPixelTransparent || isPixelTransparent;

	const onPointerDown = (evt: Event) => {
		const e = evt as PointerEventEx;
		const isTouchEvt = Boolean(
			e.type?.startsWith("touch") ||
				e.touches ||
				(e.pointerType && e.pointerType !== "mouse"),
		);
		if (isTouchEvt) {
			lastTouchTimestamp = Date.now();
		} else if (
			(e.type === "mousedown" || e.type === "pointerdown") &&
			Date.now() - lastTouchTimestamp < 600
		) {
			return;
		}

		const clientX = Number(e.clientX ?? e.touches?.[0]?.clientX ?? 0);
		const clientY = Number(e.clientY ?? e.touches?.[0]?.clientY ?? 0);
		const img = target.querySelector("img");

		const exButtonName = getExtendedButtonName(e.button);
		if (exButtonName) {
			if (img && checkTransparency(img, clientX, clientY)) {
				return;
			}
			if (e.cancelable) {
				e.preventDefault();
			}
			const device = normalizePointerDevice(e);
			activeExPress = {
				buttonName: exButtonName,
				startX: clientX,
				startY: clientY,
				device,
				hasMoved: false,
			};
			const rect = target.getBoundingClientRect();
			onGhostMouseEx?.("down", clientX, clientY, rect, exButtonName, device);
			return;
		}

		if (e.button === 2) {
			if (img && checkTransparency(img, clientX, clientY)) {
				return;
			}
			rightDragState.active = true;
			rightDragState.startX = clientX;
			rightDragState.startY = clientY;
			return;
		}

		if (e.button !== undefined && e.button !== 0) return;

		if (e.cancelable) {
			e.preventDefault();
		}

		if (img && checkTransparency(img, clientX, clientY)) {
			return;
		}

		dragInternalState.isInteracting = true;
		dragInternalState.isDragging = false;
		dragInternalState.hasMoved = false;
		nativeDrag.reset();
		strokeTracker.reset();
		longPress.reset();

		if (nativeDrag.canStartNativeDrag(e.type || "")) {
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
			const device = normalizePointerDevice(e);
			onGhostMouseDown(clientX, clientY, rect, button, device);
		}
		if (isNoDragAtPoint?.(clientX, clientY, rect)) {
			dragInternalState.isInteracting = false;
			nativeDrag.reset();
			return;
		}

		const isTouch = Boolean(
			e.touches || (e.pointerType && e.pointerType !== "mouse"),
		);
		if (isTouch) {
			longPress.start(
				() =>
					dragInternalState.isInteracting &&
					!dragInternalState.hasMoved &&
					!strokeTracker.isTriggered(),
			);
		}
	};

	const onPointerMove = (evt: Event) => {
		const e = evt as PointerEventEx;
		const isTouchEvt = Boolean(
			e.type?.startsWith("touch") ||
				e.touches ||
				(e.pointerType && e.pointerType !== "mouse"),
		);
		if (isTouchEvt) {
			lastTouchTimestamp = Date.now();
		} else if (
			(e.type === "mousemove" || e.type === "pointermove") &&
			Date.now() - lastTouchTimestamp < 600
		) {
			return;
		}

		if (activeExPress && !activeExPress.hasMoved) {
			const exX = Number(
				e.clientX ?? e.touches?.[0]?.clientX ?? activeExPress.startX,
			);
			const exY = Number(
				e.clientY ?? e.touches?.[0]?.clientY ?? activeExPress.startY,
			);
			if (
				Math.hypot(exX - activeExPress.startX, exY - activeExPress.startY) >
				DRAG_MIN_MOVE
			) {
				activeExPress.hasMoved = true;
			}
		}

		if (!dragInternalState.isInteracting) return;

		const clientX = Number(e.clientX ?? e.touches?.[0]?.clientX ?? 0);
		const clientY = Number(e.clientY ?? e.touches?.[0]?.clientY ?? 0);

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

	const onPointerUp = (evt: Event) => {
		const e = evt as PointerEventEx;
		const isTouchEvt = Boolean(
			e.type?.startsWith("touch") ||
				e.changedTouches ||
				e.touches ||
				(e.pointerType && e.pointerType !== "mouse"),
		);
		if (isTouchEvt) {
			lastTouchTimestamp = Date.now();
		} else if (
			(e.type === "mouseup" || e.type === "pointerup") &&
			Date.now() - lastTouchTimestamp < 600
		) {
			return;
		}

		const exButtonName = getExtendedButtonName(e.button);
		if (
			exButtonName &&
			activeExPress &&
			activeExPress.buttonName === exButtonName
		) {
			const press = activeExPress;
			activeExPress = null;
			const clientX = Number(e.clientX ?? press.startX);
			const clientY = Number(e.clientY ?? press.startY);
			const rect = target.getBoundingClientRect();
			const device =
				e.changedTouches || e.touches || e.pointerType
					? normalizePointerDevice(e)
					: press.device;
			onGhostMouseEx?.("up", clientX, clientY, rect, press.buttonName, device);

			if (
				!press.hasMoved &&
				Math.hypot(clientX - press.startX, clientY - press.startY) <=
					DRAG_MIN_MOVE
			) {
				const count = exClickTracker.registerClick(
					clientX,
					clientY,
					press.buttonName,
				);
				if (count >= 3) {
					onGhostMultipleClick?.(
						clientX,
						clientY,
						rect,
						count,
						press.buttonName,
						device,
						true,
					);
				} else {
					onGhostMouseClickEx?.(
						clientX,
						clientY,
						rect,
						press.buttonName,
						device,
						count === 2,
					);
				}
			}
			return;
		}

		if (e.button === 2 && rightDragState.active) {
			const startX = rightDragState.startX;
			const startY = rightDragState.startY;
			rightDragState.active = false;
			const endX = Number(e.clientX ?? startX);
			const endY = Number(e.clientY ?? startY);
			const dx = endX - startX;
			const dy = endY - startY;
			if (Math.hypot(dx, dy) > 20) {
				const direction = detectGestureDirection(dx, dy);
				const rect = target.getBoundingClientRect();
				onGhostGesture?.(startX, startY, endX, endY, direction, rect);
			}
			return;
		}

		if (e.button !== undefined && e.button !== 0) {
			return;
		}

		rafPending = false;
		handleGhostPointerUp(
			evt,
			dragInternalState,
			target,
			longPress,
			strokeTracker,
			nativeDrag,
			options,
			onGhostClick,
			onGhostDragEnd,
			onGhostMouseUp,
			leftClickTracker,
		);
	};

	target.addEventListener("mousedown", onPointerDown as EventListener);
	globalThis.addEventListener("mousemove", onPointerMove as EventListener);
	globalThis.addEventListener("mouseup", onPointerUp as EventListener);

	target.addEventListener("touchstart", onPointerDown as EventListener, {
		passive: true,
	});
	globalThis.addEventListener("touchmove", onPointerMove as EventListener, {
		passive: true,
	});
	globalThis.addEventListener("touchend", onPointerUp as EventListener);

	const cleanup = () => {
		longPress.cleanup();
		leftClickTracker.reset();
		exClickTracker.reset();
		activeExPress = null;
		rightDragState.active = false;
		target.removeEventListener("mousedown", onPointerDown as EventListener);
		globalThis.removeEventListener("mousemove", onPointerMove as EventListener);
		globalThis.removeEventListener("mouseup", onPointerUp as EventListener);

		target.removeEventListener("touchstart", onPointerDown as EventListener);
		globalThis.removeEventListener("touchmove", onPointerMove as EventListener);
		globalThis.removeEventListener("touchend", onPointerUp as EventListener);
	};

	return {
		isInteractingOrDragging: () =>
			dragInternalState.isInteracting || dragInternalState.isDragging,
		cleanup,
	};
}
