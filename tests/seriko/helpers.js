import { SurfaceAnimationManager } from "../../ui/js/surface/surface-animation-manager.js";

/**
 * アニメーション再生フレーム追跡用フィクスチャ
 */
export function animationFixture() {
	const frames = [];
	const manager = {
		currentSurfaceIdFor: () => 0,
		resolveSurfaceNumber: (id) => id,
		app: {
			ghostController: {
				updateSurface: async (...args) => {
					frames.push(args);
				},
			},
		},
	};
	return { animation: new SurfaceAnimationManager(manager), frames };
}

/**
 * インターバル発動追跡用フィクスチャ
 */
export function intervalFixture(animations, surfaceId = 0) {
	const played = [];
	const manager = {
		animations: { [surfaceId]: animations },
		currentSurfaceIdFor: () => surfaceId,
	};
	const animation = new SurfaceAnimationManager(manager);
	animation.playAnimationPatterns = (anim) => {
		played.push(anim.id);
		return Promise.resolve();
	};
	return { animation, played };
}
