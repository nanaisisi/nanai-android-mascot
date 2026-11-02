/**
 * @file touch-gesture-recognizer.js
 * @description Slot-12 タッチジェスチャー認識エンジン (Pinch, Drag, Stroke, LongPress, Tap)
 * Contract: TouchGestureEvent ディスパッチ, ドメインイベント連携
 */

import {
	TOUCH_GESTURE_TYPES,
	TouchGestureEvent,
} from "./touch-gesture-event.js";

/**
 * 2点間のユークリッド距離を計算
 * @param {{ clientX: number, clientY: number }} p1
 * @param {{ clientX: number, clientY: number }} p2
 * @returns {number}
 */
export function getTouchDistance(p1, p2) {
	const x1 = Number.isFinite(p1?.clientX) ? p1.clientX : 0;
	const y1 = Number.isFinite(p1?.clientY) ? p1.clientY : 0;
	const x2 = Number.isFinite(p2?.clientX) ? p2.clientX : 0;
	const y2 = Number.isFinite(p2?.clientY) ? p2.clientY : 0;
	return Math.hypot(x1 - x2, y1 - y2);
}

/**
 * 2点間の中心座標を計算
 * @param {{ clientX: number, clientY: number }} p1
 * @param {{ clientX: number, clientY: number }} p2
 * @returns {{ x: number, y: number }}
 */
export function getTouchCenter(p1, p2) {
	const x1 = Number.isFinite(p1?.clientX) ? p1.clientX : 0;
	const y1 = Number.isFinite(p1?.clientY) ? p1.clientY : 0;
	const x2 = Number.isFinite(p2?.clientX) ? p2.clientX : 0;
	const y2 = Number.isFinite(p2?.clientY) ? p2.clientY : 0;
	return {
		x: (x1 + x2) / 2,
		y: (y1 + y2) / 2,
	};
}

/**
 * 2点間の回転角度（度数法）を計算
 * @param {{ clientX: number, clientY: number }} p1
 * @param {{ clientX: number, clientY: number }} p2
 * @returns {number}
 */
export function getTouchAngle(p1, p2) {
	const x1 = Number.isFinite(p1?.clientX) ? p1.clientX : 0;
	const y1 = Number.isFinite(p1?.clientY) ? p1.clientY : 0;
	const x2 = Number.isFinite(p2?.clientX) ? p2.clientX : 0;
	const y2 = Number.isFinite(p2?.clientY) ? p2.clientY : 0;
	const rad = Math.atan2(y2 - y1, x2 - x1);
	return (rad * 180) / Math.PI;
}

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
		if (this._longPressTimer) {
			clearTimeout(this._longPressTimer);
			this._longPressTimer = null;
		}
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

			this._longPressTimer = setTimeout(() => {
				if (!this._hasMoved && !this._strokeTriggered && !this._isPinching) {
					this._longPressTriggered = true;
					this.emit(TOUCH_GESTURE_TYPES.LONG_PRESS, {
						centerX: this._startX,
						centerY: this._startY,
						originalEvent: e,
					});
				}
			}, this.options.longPressDelay);
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
			if (this._isPinching) return;

			const t = touches[0];
			const now = Date.now();
			const deltaX = t.clientX - this._startX;
			const deltaY = t.clientY - this._startY;
			const stepDist = Math.hypot(
				t.clientX - this._lastX,
				t.clientY - this._lastY,
			);

			const dt = Math.max(1, now - this._lastTime);
			this._vx = (t.clientX - this._lastX) / dt;
			this._vy = (t.clientY - this._lastY) / dt;

			this._lastX = t.clientX;
			this._lastY = t.clientY;
			this._lastTime = now;

			if (
				!this._hasMoved &&
				Math.hypot(deltaX, deltaY) > this.options.slopThreshold
			) {
				this._hasMoved = true;
				this._clearLongPressTimer();
			}

			if (this._hasMoved && !this._longPressTriggered) {
				// 撫で認識の判定
				this._accumulatedStroke += stepDist;
				if (
					this._accumulatedStroke >= this.options.strokeThreshold &&
					!this._strokeTriggered
				) {
					this._strokeTriggered = true;
					this.emit(TOUCH_GESTURE_TYPES.STROKE, {
						centerX: t.clientX,
						centerY: t.clientY,
						strokeDistance: this._accumulatedStroke,
						originalEvent: e,
					});
				}

				// ドラッグイベントの発火
				if (!this._isDragging) {
					this._isDragging = true;
					this.emit(TOUCH_GESTURE_TYPES.DRAG_START, {
						centerX: this._startX,
						centerY: this._startY,
						originalEvent: e,
					});
				}

				this.emit(TOUCH_GESTURE_TYPES.DRAG, {
					deltaX,
					deltaY,
					centerX: t.clientX,
					centerY: t.clientY,
					velocityX: this._vx,
					velocityY: this._vy,
					strokeDistance: this._accumulatedStroke,
					originalEvent: e,
				});
			}
		} else if (touches.length >= 2) {
			// ピンチ/回転の継続
			this._clearLongPressTimer();
			const t1 = touches[0];
			const t2 = touches[1];
			const currentDist = getTouchDistance(t1, t2);
			const currentAngle = getTouchAngle(t1, t2);
			const center = getTouchCenter(t1, t2);

			const rawScale =
				this._initialPinchDist > 0 ? currentDist / this._initialPinchDist : 1.0;
			const scale = Math.min(
				Math.max(rawScale, this.options.minScale),
				this.options.maxScale,
			);
			const rotation = currentAngle - this._initialAngle;

			if (
				Math.abs(currentDist - this._initialPinchDist) >
					this.options.slopThreshold ||
				Math.abs(rotation) > 5
			) {
				this._twoFingerMoved = true;
			}

			this._lastPinchScale = scale;

			this.emit(TOUCH_GESTURE_TYPES.PINCH, {
				scale,
				centerX: center.x,
				centerY: center.y,
				originalEvent: e,
			});

			if (Math.abs(rotation) > 5) {
				this.emit(TOUCH_GESTURE_TYPES.ROTATE, {
					rotation,
					centerX: center.x,
					centerY: center.y,
					originalEvent: e,
				});
			}
		}
	}

	_handleTouchEnd(e) {
		this._clearLongPressTimer();

		// 2本指タップ判定
		if (this._isPinching || this._twoFingerStartTime > 0) {
			const elapsed = Date.now() - this._twoFingerStartTime;
			if (
				!this._twoFingerMoved &&
				this._twoFingerStartTime > 0 &&
				elapsed <= this.options.twoFingerTapDelay &&
				e.touches.length === 0
			) {
				this._isPinching = false;
				this._twoFingerStartTime = 0;
				this.emit(TOUCH_GESTURE_TYPES.TWO_FINGER_TAP, {
					centerX: this._twoFingerCenter.x,
					centerY: this._twoFingerCenter.y,
					originalEvent: e,
				});
				return;
			}

			if (e.touches.length < 2) {
				this._isPinching = false;
				if (e.touches.length === 1) {
					// 1本指が残っている場合はドラッグ起点に更新
					const t = e.touches[0];
					this._startX = t.clientX;
					this._startY = t.clientY;
					this._lastX = t.clientX;
					this._lastY = t.clientY;
					this._hasMoved = false;
				}
			}
			return;
		}

		if (this._isDragging) {
			this._isDragging = false;
			const lastTouch = e.changedTouches?.[0];
			const endX = lastTouch ? lastTouch.clientX : this._lastX;
			const endY = lastTouch ? lastTouch.clientY : this._lastY;

			this.emit(TOUCH_GESTURE_TYPES.DRAG_END, {
				centerX: endX,
				centerY: endY,
				originalEvent: e,
			});

			// スワイプ（フリック）判定
			const totalDeltaX = endX - this._startX;
			const totalDeltaY = endY - this._startY;
			const totalDist = Math.hypot(totalDeltaX, totalDeltaY);
			const totalTime = Math.max(1, Date.now() - this._startTime);
			const velocity = totalDist / totalTime;

			let swipeDirection = null;
			if (
				totalDist >= this.options.swipeMinDistance &&
				velocity >= this.options.swipeMinVelocity
			) {
				if (Math.abs(totalDeltaX) > Math.abs(totalDeltaY)) {
					swipeDirection = totalDeltaX > 0 ? "right" : "left";
				} else {
					swipeDirection = totalDeltaY > 0 ? "down" : "up";
				}

				this.emit(TOUCH_GESTURE_TYPES.SWIPE, {
					direction: swipeDirection,
					distance: totalDist,
					velocity,
					deltaX: totalDeltaX,
					deltaY: totalDeltaY,
					centerX: endX,
					centerY: endY,
					originalEvent: e,
				});
			}

			// 画面端スナップ（Docked State / Snap）の判定
			const screenW = this.options.screenWidth;
			const snapThreshold = this.options.snapThreshold;
			let snapEdge = null;

			if (
				endX <= snapThreshold ||
				(swipeDirection === "left" && endX < screenW / 2)
			) {
				snapEdge = "left";
			} else if (
				endX >= screenW - snapThreshold ||
				(swipeDirection === "right" && endX > screenW / 2)
			) {
				snapEdge = "right";
			}

			if (snapEdge) {
				this._dockState = snapEdge;
				this.emit(TOUCH_GESTURE_TYPES.SNAP, {
					dockState: snapEdge,
					centerX: endX,
					centerY: endY,
					originalEvent: e,
				});
			} else {
				this._dockState = "none";
			}
			return;
		}

		// 移動も長押しも撫でも発生していない場合はタップ/ダブルタップとして判定
		if (
			!this._hasMoved &&
			!this._longPressTriggered &&
			!this._strokeTriggered
		) {
			const touch = e.changedTouches?.[0];
			const tapX = touch ? touch.clientX : this._startX;
			const tapY = touch ? touch.clientY : this._startY;
			const now = Date.now();

			const elapsed = now - this._lastTapTime;
			const distFromLastTap = Math.hypot(
				tapX - this._lastTapX,
				tapY - this._lastTapY,
			);

			if (
				elapsed > 0 &&
				elapsed <= this.options.doubleTapDelay &&
				distFromLastTap <= this.options.doubleTapDistance
			) {
				// ダブルタップ成立
				this._lastTapTime = 0;
				this._lastTapX = 0;
				this._lastTapY = 0;
				this.emit(TOUCH_GESTURE_TYPES.DOUBLE_TAP, {
					centerX: tapX,
					centerY: tapY,
					tapCount: 2,
					originalEvent: e,
				});
			} else {
				// 通常のシングルタップ
				this._lastTapTime = now;
				this._lastTapX = tapX;
				this._lastTapY = tapY;
				this.emit(TOUCH_GESTURE_TYPES.TAP, {
					centerX: tapX,
					centerY: tapY,
					tapCount: 1,
					originalEvent: e,
				});
			}
		}
	}

	_handleTouchCancel() {
		this.reset();
	}
}
