import { BalloonDragManager } from "./balloon-drag.js";
import {
	type DragOptions,
	setupGhostDragging,
} from "./interaction/drag-handler.js";
import {
	type HoverWheelOptions,
	setupHoverAndWheel,
} from "./interaction/hover-wheel.js";
import { isPixelTransparent } from "./interaction/transparency.js";

export type { DragOptions, HoverWheelOptions };
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
		return this.balloonDragManager.balloonOffsetX ?? 0;
	}

	set balloonOffsetX(val: number) {
		this.balloonDragManager.balloonOffsetX = val;
	}

	get balloonOffsetY(): number {
		return this.balloonDragManager.balloonOffsetY ?? 0;
	}

	set balloonOffsetY(val: number) {
		this.balloonDragManager.balloonOffsetY = val;
	}

	resetBalloonPositions() {
		this.balloonDragManager.resetOffset();
	}

	resetShellPositions() {
		if (typeof document !== "undefined") {
			const targets = document.querySelectorAll(
				".ghost-display, .character-slot, .ghost-character, .character-placeholder",
			);
			targets.forEach((el) => {
				const hEl = el as HTMLElement;
				if (hEl?.style) {
					hEl.style.left = "";
					hEl.style.top = "";
					hEl.style.right = "";
					hEl.style.bottom = "";
					hEl.style.transform = "";
					hEl.style.margin = "";
				}
				hEl.classList.remove("is-docked-left", "is-docked-right");
			});
		}
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
		options: DragOptions & HoverWheelOptions = {},
	) {
		if (!target) return;

		const {
			onGhostWheel,
			onGhostHover,
			onGhostMouseEnter,
			onGhostMouseLeave,
			onGhostStroke: optionGhostStroke,
			...dragOptions
		} = options;
		const resolvedOnGhostStroke = onGhostStroke ?? optionGhostStroke;

		const { isInteractingOrDragging } = setupGhostDragging(
			target,
			onGhostClick,
			resolvedOnGhostStroke,
			dragOptions,
			{
				toggleMenu: () =>
					(
						this.app as { toggleMenu?: () => void } | null | undefined
					)?.toggleMenu?.(),
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
			{
				onGhostWheel,
				onGhostHover,
				onGhostMouseEnter,
				onGhostMouseLeave,
				onGhostStroke:
					resolvedOnGhostStroke as HoverWheelOptions["onGhostStroke"],
			},
			isInteractingOrDragging,
		);

		this.setupBalloonDragging(target);
	}

	setupBalloonDragging(ghostTarget: HTMLElement) {
		this.balloonDragManager.setupBalloonDragging(ghostTarget);
	}
}
