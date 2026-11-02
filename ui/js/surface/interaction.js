import { BalloonDragManager } from "./balloon-drag.js";
import { setupGhostDragging } from "./interaction/drag-handler.js";
import { setupHoverAndWheel } from "./interaction/hover-wheel.js";
import { isPixelTransparent } from "./interaction/transparency.js";

// Re-export submodules for direct usage
export { isPixelTransparent, setupGhostDragging, setupHoverAndWheel };

/**
 * Nanai Android Mascot - ドラッグ & タッチインタラクション管理
 * ドラッグ移動、スナップ退避、および部位撫で（Stroke）判定
 */
export class InteractionManager {
	/**
	 * @param {import('../../main.js').NanaiAndroidMascotApp} app
	 */
	constructor(app) {
		/** @type {import('../../main.js').NanaiAndroidMascotApp} */
		this.app = app;
		this.balloonDragManager = new BalloonDragManager(this);
	}

	get balloonOffsetX() {
		return this.balloonDragManager.balloonOffsetX;
	}

	set balloonOffsetX(val) {
		this.balloonDragManager.balloonOffsetX = val;
	}

	get balloonOffsetY() {
		return this.balloonDragManager.balloonOffsetY;
	}

	set balloonOffsetY(val) {
		this.balloonDragManager.balloonOffsetY = val;
	}

	/**
	 * @param {HTMLElement} img
	 * @param {number} clientX
	 * @param {number} clientY
	 */
	isPixelTransparent(img, clientX, clientY) {
		return isPixelTransparent(img, clientX, clientY);
	}

	setupDragging(target, onGhostClick, onGhostStroke, options = {}) {
		if (!target) return;

		const { onGhostWheel, onGhostHover, ...dragOptions } = options;

		// ゴースト本体のドラッグ移動・撫で・ドッキング処理
		const { isInteractingOrDragging } = setupGhostDragging(
			target,
			onGhostClick,
			onGhostStroke,
			dragOptions,
			{
				toggleMenu: () => this.app?.toggleMenu(),
				updateFollowPosition: (newX, newY) => {
					this.balloonDragManager.updateFollowPosition(newX, newY);
				},
				isPixelTransparent: (img, clientX, clientY) =>
					this.isPixelTransparent(img, clientX, clientY),
			},
		);

		// マウスホイール (OnMouseWheel) & ホバー (OnMouseHover)
		setupHoverAndWheel(
			target,
			{ onGhostWheel, onGhostHover },
			isInteractingOrDragging,
		);

		// バルーン自体のドラッグによる相対位置調整を設定
		this.setupBalloonDragging(target);
	}

	/**
	 * バルーンをドラッグしてキャラクターに対する相対位置（可変）を変更する
	 */
	setupBalloonDragging(ghostTarget) {
		this.balloonDragManager.setupBalloonDragging(ghostTarget);
	}
}
