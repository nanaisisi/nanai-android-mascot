/**
 * @file touch-gesture-event.js
 * @description Slot-12 Android タッチ & ジェスチャーイベント定義
 * Contract: TouchGestureEvent, イベント命名規約 nas:touch:*
 */

/**
 * ジェスチャーイベント種別定数
 */
export const TOUCH_GESTURE_TYPES = {
	PINCH: "nas:touch:pinch",
	DRAG: "nas:touch:drag",
	DRAG_START: "nas:touch:dragstart",
	DRAG_END: "nas:touch:dragend",
	LONG_PRESS: "nas:touch:longpress",
	TAP: "nas:touch:tap",
	DOUBLE_TAP: "nas:touch:doubletap",
	STROKE: "nas:touch:stroke",
	ROTATE: "nas:touch:rotate",
};

/**
 * タッチジェスチャーイベントクラス
 * カスタムイベントとしてディスパッチ可能
 */
export class TouchGestureEvent {
	/**
	 * @param {string} type イベント種別 (nas:touch:*)
	 * @param {object} detail イベント詳細データ
	 * @param {number} [detail.scale=1.0] ピンチ操作の拡大縮小率
	 * @param {number} [detail.deltaX=0] X軸移動量
	 * @param {number} [detail.deltaY=0] Y軸移動量
	 * @param {number} [detail.centerX=0] 操作中心点X
	 * @param {number} [detail.centerY=0] 操作中心点Y
	 * @param {number} [detail.rotation=0] 回転角 (度数法)
	 * @param {number} [detail.strokeDistance=0] 撫で操作の積算距離
	 * @param {number} [detail.tapCount=1] タップ回数 (1=シングルタップ, 2=ダブルタップ)
	 * @param {Event} [detail.originalEvent=null] 元のDOMイベント (TouchEvent/PointerEvent)
	 */
	constructor(type, detail = {}) {
		this.type = type;
		this.scale = detail.scale ?? 1.0;
		this.deltaX = detail.deltaX ?? 0;
		this.deltaY = detail.deltaY ?? 0;
		this.centerX = detail.centerX ?? 0;
		this.centerY = detail.centerY ?? 0;
		this.rotation = detail.rotation ?? 0;
		this.strokeDistance = detail.strokeDistance ?? 0;
		this.tapCount = detail.tapCount ?? 1;
		this.originalEvent = detail.originalEvent ?? null;
		this.timestamp = Date.now();
		this.defaultPrevented = false;
	}

	/**
	 * デフォルト動作の抑止フラグを立てる
	 */
	preventDefault() {
		this.defaultPrevented = true;
		if (
			this.originalEvent &&
			typeof this.originalEvent.preventDefault === "function"
		) {
			this.originalEvent.preventDefault();
		}
	}
}
