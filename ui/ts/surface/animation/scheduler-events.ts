/**
 * @file scheduler-events.ts
 * @brief SERIKO アニメーションスケジューラおよびステップイベント
 */

export interface FrameStepEventParams {
	scopeId: unknown;
	baseSurfaceId: unknown;
	animationId: unknown;
	pattern: unknown;
	elapsedMs: unknown;
	isFinished: unknown;
	isBackground?: boolean;
	offsetX?: number;
	offsetY?: number;
}

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
	}: FrameStepEventParams) {
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
	listeners: Set<(event: FrameStepEvent) => void>;

	constructor(animationManager: unknown) {
		this.animationManager = animationManager;
		this.listeners = new Set();
	}

	onFrameStep(listener: (event: FrameStepEvent) => void) {
		this.listeners.add(listener);
		return () => this.listeners.delete(listener);
	}

	notifyFrameStep(event: FrameStepEvent) {
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
