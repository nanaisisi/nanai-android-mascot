import { BalloonDragManager } from "./balloon-drag.js";
import { setupGhostDragging } from "./interaction/drag-handler.js";
import { setupHoverAndWheel } from "./interaction/hover-wheel.js";
import { isPixelTransparent } from "./interaction/transparency.js";

export { isPixelTransparent, setupGhostDragging, setupHoverAndWheel };

/**
 * Nanai Android Mascot - ドラッグ & タッチインタラクション管理
 */
export class InteractionManager {
	app: unknown;
	balloonDragManager: BalloonDragManager;

	constructor(app: unknown) {
		this.app = app;
		this.balloonDragManager = new BalloonDragManager(this);
	}

	get balloonOffsetX(): number {
		return this.balloonDragManager.balloonOffsetX;
	}

	set balloonOffsetX(val: number) {
		this.balloonDragManager.balloonOffsetX = val;
	}

	get balloonOffsetY(): number {
		return this.balloonDragManager.balloonOffsetY;
	}

	set balloonOffsetY(val: number) {
		this.balloonDragManager.balloonOffsetY = val;
	}

	isPixelTransparent(
		img: HTMLElement,
		clientX: number,
		clientY: number,
	): boolean {
		return isPixelTransparent(img, clientX, clientY);
	}

	setupDragging(
		target: HTMLElement,
		onGhostClick: unknown,
		onGhostStroke: unknown,
		options: unknown = {},
	) {
		if (!target) return;

		const { onGhostWheel, onGhostHover, ...dragOptions } = options;

		const { isInteractingOrDragging } = setupGhostDragging(
			target,
			onGhostClick,
			onGhostStroke,
			dragOptions,
			{
				toggleMenu: () => this.app?.toggleMenu(),
				updateFollowPosition: (newX: number, newY: number) => {
					this.balloonDragManager.updateFollowPosition(newX, newY);
				},
				isPixelTransparent: (
					img: HTMLElement,
					clientX: number,
					clientY: number,
				) => this.isPixelTransparent(img, clientX, clientY),
			},
		);

		setupHoverAndWheel(
			target,
			{ onGhostWheel, onGhostHover },
			isInteractingOrDragging,
		);

		this.setupBalloonDragging(target);
	}

	setupBalloonDragging(ghostTarget: HTMLElement) {
		this.balloonDragManager.setupBalloonDragging(ghostTarget);
	}
}
