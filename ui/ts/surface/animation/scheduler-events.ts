/**
 * @file scheduler-events.js
 * @brief SERIKO アニメーションスケジューラおよびステップイベント
 */

/**
 * SERIKO フレーム更新ステップイベント (Slot-08 外部インターフェース規約)
 */
export class FrameStepEvent {
	scopeId: unknown;
	baseSurfaceId: unknown;
	animationId: unknown;
	pattern: unknown;
	elapsedMs: unknown;
	isFinished: unknown;
	isBackground: boolean;
	offsetX: number;
	offsetY: number;
	/**
	 * @param {object} params
	 * @param {number} params.scopeId
	 * @param {number|string} params.baseSurfaceId
	 * @param {number|string} params.animationId
	 * @param {object} params.pattern
	 * @param {number} params.elapsedMs
	 * @param {boolean} params.isFinished
	 * @param {boolean} [params.isBackground=false]
	 * @param {number} [params.offsetX=0]
	 * @param {number} [params.offsetY=0]
	 */
	constructor({
		scopeId,
		baseSurfaceId,
		animationId,
		pattern,
		elapsedMs,
		isFinished,
		isBackground = false,
		offsetX = 0,
		offsetY = 0,
	}) {
		this.scopeId = scopeId;
		this.baseSurfaceId = baseSurfaceId;
		this.animationId = animationId;
		this.pattern = pattern;
		this.elapsedMs = elapsedMs;
		this.isFinished = isFinished;
		this.isBackground = isBackground;
		this.offsetX = offsetX;
		this.offsetY = offsetY;
	}
}

/**
 * SERIKO アニメーションスケジューラ (Slot-08 外部インターフェース規約)
 */
export class AnimationScheduler {
	animationManager: unknown;
	listeners: Set<unknown>;
	/**
	 * @param {import('../surface-animation-manager.js').SurfaceAnimationManager} animationManager
	 */
	constructor(animationManager: this) {
		this.animationManager = animationManager;
		/** @type {Set<(event: FrameStepEvent) => void>} */
		this.listeners = new Set();
	}

	onFrameStep(listener: unknown) {
		this.listeners.add(listener);
		return () => this.listeners.delete(listener);
	}

	notifyFrameStep(event: unknown) {
		for (const listener of this.listeners) {
			try {
				listener(event);
			} catch (err) {
				console.error("Error in AnimationScheduler frame listener:", err);
			}
		}
	}
}

/**
 * ダミープレースホルダーCanvas生成 (Slot-08 先行構築・画像バッファ未存在時フォールバック)
 * @param {number} width
 * @param {number} height
 * @param {string} color
 * @returns {HTMLCanvasElement|object}
 */
export function createPlaceholderCanvas(
	width = 200,
	height = 400,
	color = "rgba(0,0,0,0)",
) {
	if (typeof document === "undefined") {
		return {
			width,
			height,
			toDataURL: () => "data:image/png;base64,mockPlaceholder",
		};
	}
	const canvas = document.createElement("canvas");
	canvas.width = width;
	canvas.height = height;
	const ctx = canvas.getContext("2d");
	if (ctx) {
		ctx.fillStyle = color;
		ctx.fillRect(0, 0, width, height);
	}
	return canvas;
}
