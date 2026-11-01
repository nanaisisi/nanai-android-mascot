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
	return Math.hypot(p1.clientX - p2.clientX, p1.clientY - p2.clientY);
}

/**
 * 2点間の中心座標を計算
 * @param {{ clientX: number, clientY: number }} p1
 * @param {{ clientX: number, clientY: number }} p2
 * @returns {{ x: number, y: number }}
 */
export function getTouchCenter(p1, p2) {
	return {
		x: (p1.clientX + p2.clientX) / 2,
		y: (p1.clientY + p2.clientY) / 2,
	};
}

/**
 * 2点間の回転角度（度数法）を計算
 * @param {{ clientX: number, clientY: number }} p1
 * @param {{ clientX: number, clientY: number }} p2
 * @returns {number}
 */
export function getTouchAngle(p1, p2) {
	const rad = Math.atan2(p2.clientY - p1.clientY, p2.clientX - p1.clientX);
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
	 */
	constructor(element, options = {}) {
		this.element = element;
		this.options = {
			longPressDelay: options.longPressDelay ?? 600,
			strokeThreshold: options.strokeThreshold ?? 50,
			slopThreshold: options.slopThreshold ?? 8,
		};

		this._listeners = new Map();
		this._activeTouches = new Map();

		// ジェスチャー状態
		this._isPinching = false;
		this._isDragging = false;
		this._initialPinchDist = 0;
		this._initialAngle = 0;
		this._lastPinchScale = 1.0;

		this._startX = 0;
		this._startY = 0;
		this._lastX = 0;
		this._lastY = 0;
		this._accumulatedStroke = 0;
		this._hasMoved = false;
		this._strokeTriggered = false;
		this._longPressTimer = null;
		this._longPressTriggered = false;

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
	 * 破棄処理
	 */
	destroy() {
		this._clearLongPressTimer();
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
			this._startX = t.clientX;
			this._startY = t.clientY;
			this._lastX = t.clientX;
			this._lastY = t.clientY;
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
		} else if (touches.length >= 2) {
			// マルチタッチ（ピンチ/回転）の開始
			this._clearLongPressTimer();
			this._isPinching = true;
			this._isDragging = false;
			const t1 = touches[0];
			const t2 = touches[1];
			this._initialPinchDist = getTouchDistance(t1, t2);
			this._initialAngle = getTouchAngle(t1, t2);
			this._lastPinchScale = 1.0;
		}
	}

	_handleTouchMove(e) {
		const touches = e.touches;
		if (touches.length === 1) {
			if (this._isPinching) return;

			const t = touches[0];
			const deltaX = t.clientX - this._startX;
			const deltaY = t.clientY - this._startY;
			const stepDist = Math.hypot(
				t.clientX - this._lastX,
				t.clientY - this._lastY,
			);
			this._lastX = t.clientX;
			this._lastY = t.clientY;

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

			const scale =
				this._initialPinchDist > 0 ? currentDist / this._initialPinchDist : 1.0;
			const rotation = currentAngle - this._initialAngle;

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

		if (this._isPinching) {
			if (e.touches.length < 2) {
				this._isPinching = false;
			}
			return;
		}

		if (this._isDragging) {
			this._isDragging = false;
			const lastTouch = e.changedTouches?.[0];
			this.emit(TOUCH_GESTURE_TYPES.DRAG_END, {
				centerX: lastTouch ? lastTouch.clientX : this._lastX,
				centerY: lastTouch ? lastTouch.clientY : this._lastY,
				originalEvent: e,
			});
			return;
		}

		// 移動も長押しも撫でも発生していない場合はタップとして判定
		if (
			!this._hasMoved &&
			!this._longPressTriggered &&
			!this._strokeTriggered
		) {
			const touch = e.changedTouches?.[0];
			this.emit(TOUCH_GESTURE_TYPES.TAP, {
				centerX: touch ? touch.clientX : this._startX,
				centerY: touch ? touch.clientY : this._startY,
				originalEvent: e,
			});
		}
	}

	_handleTouchCancel() {
		this._clearLongPressTimer();
		this._isPinching = false;
		this._isDragging = false;
	}
}
