/**
 * @file touch-gesture-recognizer.js
 * @description Slot-12 タッチジェスチャー認識エンジン (Pinch, Drag, Stroke, LongPress, Tap)
 * Contract: TouchGestureEvent ディスパッチ, ドメインイベント連携
 */

import { TouchGestureEvent } from "./touch-gesture-event.js";
import {
	getTouchAngle,
	getTouchCenter,
	getTouchDistance,
} from "./touch-helpers.js";
import {
	handleDragEndAndSnap,
	processMultiTouchMove,
	processSingleTouchMove,
} from "./touch-motion-handler.js";
import {
	clearLongPressTimer,
	handleTapOrDoubleTapEnd,
	handleTwoFingerTapEnd,
	startLongPressTimer,
} from "./touch-tap-handler.js";

export {
	getTouchAngle,
	getTouchCenter,
	getTouchDistance,
} from "./touch-helpers.js";

/**
 * タッチジェスチャー認識クラス
 */
export class TouchGestureRecognizer {
	/**
	 * @param {HTMLElement} element 対象DOM要素
	 * @param {object} [options={}]
	 * @param {number} [options.longPressDelay=600] 長押し認識時間(ms)
	 * @param {number} [options.strokeThreshold=50] 撫で認識移動積算閾値(px)
	 * @param {number} [options.slopThreshold=8] 誤タッチ防止用移動閾値(px)
	 * @param {number} [options.doubleTapDelay=300] ダブルタップ認識最大間隔(ms)
	 * @param {number} [options.doubleTapDistance=24] ダブルタップ判定許容半径(px)
	 * @param {number} [options.minScale=0.2] 最小ピンチ倍率
	 * @param {number} [options.maxScale=5.0] 最大ピンチ倍率
	 * @param {number} [options.swipeMinDistance=40] スワイプ判定最小移動距離(px)
	 * @param {number} [options.swipeMinVelocity=0.3] スワイプ判定最小速度(px/ms)
	 * @param {number} [options.twoFingerTapDelay=300] 2本指タップ最大許容時間(ms)
	 * @param {boolean} [options.throttleWithRaf=false] requestAnimationFrameによるMoveイベントの間引き
	 */
	constructor(element, options = {}) {
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
		this._dockState = "none"; // "none" | "left" | "right"
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

		this._boundTouchStart = this._handleTouchStart.bind(this);
		this._boundTouchMove = this._handleTouchMove.bind(this);
		this._boundTouchEnd = this._handleTouchEnd.bind(this);
		this._boundTouchCancel = this._handleTouchCancel.bind(this);

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

	/**
	 * イベントリスナー登録
	 * @param {string} type
	 * @param {Function} handler
	 * @returns {() => void} リスナー解除関数
	 */
	on(type, handler) {
		if (!this._listeners.has(type)) {
			this._listeners.set(type, new Set());
		}
		this._listeners.get(type).add(handler);
		return () => this.off(type, handler);
	}

	/**
	 * イベントリスナー解除
	 * @param {string} type
	 * @param {Function} handler
	 */
	off(type, handler) {
		const set = this._listeners.get(type);
		if (set) {
			set.delete(handler);
			if (set.size === 0) {
				this._listeners.delete(type);
			}
		}
	}

	/**
	 * ジェスチャーイベントの発火
	 * @param {string} type
	 * @param {object} detail
	 * @returns {TouchGestureEvent}
	 */
	emit(type, detail = {}) {
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

	/**
	 * 現在のドッキング・スナップ状態を取得 ("none" | "left" | "right")
	 * @returns {"none" | "left" | "right"}
	 */
	getDockState() {
		return this._dockState;
	}

	/**
	 * ドッキング・スナップ状態を設定
	 * @param {"none" | "left" | "right"} state
	 */
	setDockState(state) {
		if (state === "left" || state === "right" || state === "none") {
			this._dockState = state;
		}
	}

	/**
	 * インタラクションおよびトラッキング状態のリセット
	 */
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

	/**
	 * 破棄処理
	 */
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

	_handleTouchStart(e) {
		const touches = e.touches;
		this._clearLongPressTimer();

		if (touches.length === 1) {
			// シングルタッチの開始
			const t = touches[0];
			const now = Date.now();
			this._startX = t.clientX;
			this._startY = t.clientY;
			this._startTime = now;
			this._lastX = t.clientX;
			this._lastY = t.clientY;
			this._lastTime = now;
			this._vx = 0;
			this._vy = 0;
			this._hasMoved = false;
			this._isDragging = false;
			this._accumulatedStroke = 0;
			this._strokeTriggered = false;
			this._longPressTriggered = false;
			this._isPinching = false;

			startLongPressTimer(this, e);
		} else if (touches.length === 2) {
			// 2本指タッチ（ピンチ/回転/2本指タップ）の開始
			this._clearLongPressTimer();
			this._isPinching = true;
			this._isDragging = false;
			const t1 = touches[0];
			const t2 = touches[1];
			this._initialPinchDist = getTouchDistance(t1, t2);
			this._initialAngle = getTouchAngle(t1, t2);
			this._lastPinchScale = 1.0;

			this._twoFingerStartTime = Date.now();
			this._twoFingerMoved = false;
			this._twoFingerCenter = getTouchCenter(t1, t2);
		} else if (touches.length > 2) {
			this._clearLongPressTimer();
			this._twoFingerMoved = true;
		}
	}

	_handleTouchMove(e) {
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

	_processTouchMove(e) {
		const touches = e.touches;
		if (touches.length === 1) {
			processSingleTouchMove(this, e);
		} else if (touches.length >= 2) {
			processMultiTouchMove(this, e);
		}
	}

	_handleTouchEnd(e) {
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
