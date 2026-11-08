import { BalloonDragManager } from "./balloon-drag.js";
import { setupGhostDragging } from "./interaction/drag-handler.js";
import { setupHoverAndWheel } from "./interaction/hover-wheel.js";
import { isPixelTransparent } from "./interaction/transparency.js";

export { isPixelTransparent, setupGhostDragging, setupHoverAndWheel };

/**
 * Nanai Android Mascot - ドラッグ & タッチインタラクション管理
 */
export class InteractionManager {
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	app: any;
	balloonDragManager: BalloonDragManager;

	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	constructor(app: any) {
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
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		onGhostClick: any,
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		onGhostStroke: any,
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		options: any = {},
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
