/**
 * @file touch-gesture-event.js
 * @description Slot-12 Android タッチ & ジェスチャーイベント定義
 * Contract: TouchGestureEvent, イベント命名規約 nam:touch:*
 */

/**
 * ジェスチャーイベント種別定数
 */
export const TOUCH_GESTURE_TYPES = {
	PINCH: "nam:touch:pinch",
	DRAG: "nam:touch:drag",
	DRAG_START: "nam:touch:dragstart",
	DRAG_END: "nam:touch:dragend",
	LONG_PRESS: "nam:touch:longpress",
	TAP: "nam:touch:tap",
	DOUBLE_TAP: "nam:touch:doubletap",
	TWO_FINGER_TAP: "nam:touch:twofingertap",
	SWIPE: "nam:touch:swipe",
	STROKE: "nam:touch:stroke",
	ROTATE: "nam:touch:rotate",
	SNAP: "nam:touch:snap",
};

export interface TouchPointLike {
	clientX: number;
	clientY: number;
}

export interface TouchEventLike {
	type?: string;
	touches?: ArrayLike<TouchPointLike>;
	changedTouches?: ArrayLike<TouchPointLike>;
	preventDefault?: () => void;
	stopPropagation?: () => void;
}

export interface TouchGestureEventDetail {
	scale?: number;
	deltaX?: number;
	deltaY?: number;
	centerX?: number;
	centerY?: number;
	rotation?: number;
	strokeDistance?: number;
	tapCount?: number;
	direction?: string;
	distance?: number;
	velocity?: number;
	velocityX?: number;
	velocityY?: number;
	dockState?: string;
	originalEvent?: Event | TouchEventLike | null;
}

/**
 * タッチジェスチャーイベントクラス
 * カスタムイベントとしてディスパッチ可能
 */
export class TouchGestureEvent {
	type: string;
	scale: number;
	deltaX: number;
	deltaY: number;
	centerX: number;
	centerY: number;
	rotation: number;
	strokeDistance: number;
	tapCount: number;
	direction: string;
	distance: number;
	velocity: number;
	velocityX: number;
	velocityY: number;
	dockState: string;
	originalEvent: Event | TouchEventLike | null;
	timestamp: number;
	defaultPrevented: boolean;
	/**
	 * @param {string} type イベント種別 (nam:touch:*)
	 * @param {TouchGestureEventDetail} detail イベント詳細データ
	 */
	constructor(type: string, detail: TouchGestureEventDetail = {}) {
		this.type = type;
		this.scale = detail.scale ?? 1.0;
		this.deltaX = detail.deltaX ?? 0;
		this.deltaY = detail.deltaY ?? 0;
		this.centerX = detail.centerX ?? 0;
		this.centerY = detail.centerY ?? 0;
		this.rotation = detail.rotation ?? 0;
		this.strokeDistance = detail.strokeDistance ?? 0;
		this.tapCount = detail.tapCount ?? 1;
		this.direction = detail.direction ?? "";
		this.distance = detail.distance ?? 0;
		this.velocity = detail.velocity ?? 0;
		this.velocityX = detail.velocityX ?? 0;
		this.velocityY = detail.velocityY ?? 0;
		this.dockState = detail.dockState ?? "none";
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
