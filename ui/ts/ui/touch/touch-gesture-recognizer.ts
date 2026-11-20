/**
 * @file touch-gesture-recognizer.js
 * @description Slot-12 タッチジェスチャー認識エンジン (Pinch, Drag, Stroke, LongPress, Tap)
 * Contract: TouchGestureEvent ディスパッチ, ドメインイベント連携
 */

import {
	type TouchEventLike,
	TouchGestureEvent,
	type TouchGestureEventDetail,
} from "./touch-gesture-event.js";
import {
	handleDragEndAndSnap,
	processMultiTouchMove,
	processSingleTouchMove,
} from "./touch-motion-handler.js";
import { handleTouchStartEvent } from "./touch-start-handler.js";
import {
	clearLongPressTimer,
	handleTapOrDoubleTapEnd,
	handleTwoFingerTapEnd,
} from "./touch-tap-handler.js";

export {
	getTouchAngle,
	getTouchCenter,
	getTouchDistance,
} from "./touch-helpers.js";

export interface TouchGestureOptions {
	longPressDelay: number;
	strokeThreshold: number;
	slopThreshold: number;
	doubleTapDelay: number;
	doubleTapDistance: number;
	minScale: number;
	maxScale: number;
	swipeMinDistance: number;
	swipeMinVelocity: number;
	twoFingerTapDelay: number;
	throttleWithRaf: boolean;
	snapThreshold: number;
	screenWidth: number;
}

export type TouchGestureHandler = (event: TouchGestureEvent) => void;

export interface TouchElementLike {
	addEventListener?: (
		type: string,
		listener: EventListener,
		options?: boolean | AddEventListenerOptions,
	) => void;
	removeEventListener?: (
		type: string,
		listener: EventListener,
		options?: boolean | EventListenerOptions,
	) => void;
}

/**
 * タッチジェスチャー認識クラス
 */
export class TouchGestureRecognizer {
	element: TouchElementLike | null | undefined;
	options: TouchGestureOptions;
	_listeners: Map<string, Set<TouchGestureHandler>>;
	_activeTouches: Map<number, unknown>;
	_isPinching: boolean;
	_isDragging: boolean;
	_dockState: string;
	_initialPinchDist: number;
	_initialAngle: number;
	_lastPinchScale: number;
	_startX: number;
	_startY: number;
	_startTime: number;
	_lastX: number;
	_lastY: number;
	_lastTime: number;
	_vx: number;
	_vy: number;
	_accumulatedStroke: number;
	_hasMoved: boolean;
	_strokeTriggered: boolean;
	_longPressTimer: ReturnType<typeof setTimeout> | null;
	_longPressTriggered: boolean;
	_twoFingerStartTime: number;
	_twoFingerMoved: boolean;
	_twoFingerCenter: { x: number; y: number };
	_lastTapTime: number;
	_lastTapX: number;
	_lastTapY: number;
	_rafId: number | null;
	_pendingMoveEvent: TouchEvent | TouchEventLike | null;
	_boundTouchStart: EventListener;
	_boundTouchMove: EventListener;
	_boundTouchEnd: EventListener;
	_boundTouchCancel: EventListener;

	constructor(
		element: TouchElementLike | null | undefined,
		options: Partial<TouchGestureOptions> = {},
	) {
		this.element = element;
		this.options = {
			longPressDelay: options.longPressDelay ?? 600,
			strokeThreshold: options.strokeThreshold ?? 50,
			slopThreshold: options.slopThreshold ?? 8,
			doubleTapDelay: options.doubleTapDelay ?? 300,
			doubleTapDistance: options.doubleTapDistance ?? 24,
			minScale: options.minScale ?? 0.2,
			maxScale: options.maxScale ?? 5.0,
			swipeMinDistance: options.swipeMinDistance ?? 40,
			swipeMinVelocity: options.swipeMinVelocity ?? 0.3,
			twoFingerTapDelay: options.twoFingerTapDelay ?? 300,
			throttleWithRaf: options.throttleWithRaf ?? false,
			snapThreshold: options.snapThreshold ?? 40,
			screenWidth:
				options.screenWidth ??
				(typeof window !== "undefined" ? window.innerWidth || 360 : 360),
		};

		this._listeners = new Map();
		this._activeTouches = new Map();

		// ジェスチャー状態
		this._isPinching = false;
		this._isDragging = false;
		this._dockState = "none";
		this._initialPinchDist = 0;
		this._initialAngle = 0;
		this._lastPinchScale = 1.0;

		this._startX = 0;
		this._startY = 0;
		this._startTime = 0;
		this._lastX = 0;
		this._lastY = 0;
		this._lastTime = 0;
		this._vx = 0;
		this._vy = 0;
		this._accumulatedStroke = 0;
		this._hasMoved = false;
		this._strokeTriggered = false;
		this._longPressTimer = null;
		this._longPressTriggered = false;

		// 2本指タップ管理
		this._twoFingerStartTime = 0;
		this._twoFingerMoved = false;
		this._twoFingerCenter = { x: 0, y: 0 };

		// ダブルタップ管理
		this._lastTapTime = 0;
		this._lastTapX = 0;
		this._lastTapY = 0;

		// RAFスロットル管理
		this._rafId = null;
		this._pendingMoveEvent = null;

		this._boundTouchStart = this._handleTouchStart.bind(this) as EventListener;
		this._boundTouchMove = this._handleTouchMove.bind(this) as EventListener;
		this._boundTouchEnd = this._handleTouchEnd.bind(this) as EventListener;
		this._boundTouchCancel = this._handleTouchCancel.bind(
			this,
		) as EventListener;

		if (this.element && typeof this.element.addEventListener === "function") {
			this.element.addEventListener("touchstart", this._boundTouchStart, {
				passive: false,
			});
			this.element.addEventListener("touchmove", this._boundTouchMove, {
				passive: false,
			});
			this.element.addEventListener("touchend", this._boundTouchEnd, {
				passive: false,
			});
			this.element.addEventListener("touchcancel", this._boundTouchCancel, {
				passive: false,
			});
		}
	}

	on(type: string, handler: TouchGestureHandler) {
		let set = this._listeners.get(type);
		if (!set) {
			set = new Set();
			this._listeners.set(type, set);
		}
		set.add(handler);
		return () => this.off(type, handler);
	}

	off(type: string, handler: TouchGestureHandler) {
		const set = this._listeners.get(type);
		if (set) {
			set.delete(handler);
			if (set.size === 0) {
				this._listeners.delete(type);
			}
		}
	}

	emit(type: string, detail: TouchGestureEventDetail = {}): TouchGestureEvent {
		const event = new TouchGestureEvent(type, detail);
		const set = this._listeners.get(type);
		if (set) {
			for (const handler of set) {
				try {
					handler(event);
				} catch (err) {
					console.error(
						`Error in TouchGestureRecognizer handler for ${type}:`,
						err,
					);
				}
			}
		}
		return event;
	}

	getDockState() {
		return this._dockState;
	}

	setDockState(state: string) {
		if (state === "left" || state === "right" || state === "none") {
			this._dockState = state;
		}
	}

	/**
	 * ジェスチャー認識オプションを取得
	 * @returns {TouchGestureOptions}
	 */
	getGestureOptions(): TouchGestureOptions {
		return { ...this.options };
	}

	/**
	 * ジェスチャー認識オプションを動的に設定
	 * @param {Partial<TouchGestureOptions>} options
	 */
	setGestureOptions(
		options: Partial<TouchGestureOptions> = {},
	): TouchGestureOptions {
		if (options.longPressDelay !== undefined) {
			const delay = Number(options.longPressDelay);
			if (Number.isFinite(delay) && delay >= 0) {
				this.options.longPressDelay = delay;
			}
		}
		if (options.strokeThreshold !== undefined) {
			const val = Number(options.strokeThreshold);
			if (Number.isFinite(val) && val >= 0) {
				this.options.strokeThreshold = val;
			}
		}
		if (options.slopThreshold !== undefined) {
			const val = Number(options.slopThreshold);
			if (Number.isFinite(val) && val >= 0) {
				this.options.slopThreshold = val;
			}
		}
		if (options.doubleTapDelay !== undefined) {
			const val = Number(options.doubleTapDelay);
			if (Number.isFinite(val) && val >= 0) {
				this.options.doubleTapDelay = val;
			}
		}
		if (options.doubleTapDistance !== undefined) {
			const val = Number(options.doubleTapDistance);
			if (Number.isFinite(val) && val >= 0) {
				this.options.doubleTapDistance = val;
			}
		}
		if (options.swipeMinDistance !== undefined) {
			const val = Number(options.swipeMinDistance);
			if (Number.isFinite(val) && val >= 0) {
				this.options.swipeMinDistance = val;
			}
		}
		if (options.swipeMinVelocity !== undefined) {
			const val = Number(options.swipeMinVelocity);
			if (Number.isFinite(val) && val >= 0) {
				this.options.swipeMinVelocity = val;
			}
		}
		if (options.snapThreshold !== undefined) {
			const val = Number(options.snapThreshold);
			if (Number.isFinite(val) && val >= 0) {
				this.options.snapThreshold = val;
			}
		}
		if (options.screenWidth !== undefined) {
			const val = Number(options.screenWidth);
			if (Number.isFinite(val) && val > 0) {
				this.options.screenWidth = val;
			}
		}
		return this.getGestureOptions();
	}

	/**
	 * タッチ・ジェスチャー操作がアクティブ（追尾中）かどうか
	 * @returns {boolean}
	 */
	isGestureActive() {
		return (
			this._activeTouches.size > 0 ||
			this._isDragging ||
			this._isPinching ||
			this._longPressTimer !== null
		);
	}

	reset() {
		this._clearLongPressTimer();
		this._cancelRaf();
		this._isPinching = false;
		this._isDragging = false;
		this._hasMoved = false;
		this._strokeTriggered = false;
		this._longPressTriggered = false;
		this._accumulatedStroke = 0;
		this._vx = 0;
		this._vy = 0;
		this._twoFingerStartTime = 0;
		this._twoFingerMoved = false;
		this._activeTouches.clear();
	}

	_cancelRaf() {
		if (this._rafId !== null) {
			if (typeof cancelAnimationFrame === "function") {
				cancelAnimationFrame(this._rafId);
			}
			this._rafId = null;
			this._pendingMoveEvent = null;
		}
	}

	destroy() {
		this.reset();
		if (
			this.element &&
			typeof this.element.removeEventListener === "function"
		) {
			this.element.removeEventListener("touchstart", this._boundTouchStart);
			this.element.removeEventListener("touchmove", this._boundTouchMove);
			this.element.removeEventListener("touchend", this._boundTouchEnd);
			this.element.removeEventListener("touchcancel", this._boundTouchCancel);
		}
		this._listeners.clear();
		this._activeTouches.clear();
	}

	_clearLongPressTimer() {
		clearLongPressTimer(this);
	}

	_handleTouchStart(e: TouchEvent | TouchEventLike) {
		handleTouchStartEvent(this, e);
	}

	_handleTouchMove(e: TouchEvent | TouchEventLike | null | undefined) {
		if (!e) return;
		if (
			this.options.throttleWithRaf &&
			typeof requestAnimationFrame === "function"
		) {
			this._pendingMoveEvent = e;
			if (this._rafId === null) {
				this._rafId = requestAnimationFrame(() => {
					this._rafId = null;
					if (this._pendingMoveEvent) {
						const ev = this._pendingMoveEvent;
						this._pendingMoveEvent = null;
						this._processTouchMove(ev);
					}
				});
			}
		} else {
			this._processTouchMove(e);
		}
	}

	_processTouchMove(e: TouchEvent | TouchEventLike) {
		const touches = e.touches;
		if (!touches) return;
		if (touches.length === 1) {
			processSingleTouchMove(this, e);
		} else if (touches.length >= 2) {
			processMultiTouchMove(this, e);
		}
	}

	_handleTouchEnd(e: TouchEvent | TouchEventLike) {
		this._clearLongPressTimer();

		// 2本指タップ判定
		if (handleTwoFingerTapEnd(this, e)) {
			return;
		}

		if (this._isDragging) {
			handleDragEndAndSnap(this, e);
			return;
		}

		// 移動も長押しも撫でも発生していない場合はタップ/ダブルタップとして判定
		handleTapOrDoubleTapEnd(this, e);
	}

	_handleTouchCancel() {
		this.reset();
	}
}
