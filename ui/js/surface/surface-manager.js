import { SurfaceAnimationManager } from "./surface-animation-manager.js";
import { surfaceLoadMethods } from "./surface-load.js";
import { surfaceRenderMethods } from "./surface-render.js";

/**
 * Nanai Android Mascot - surfaces.txt パーサー & 当たり判定（Collision）マネージャー
 */
export class SurfaceManager {
	/**
	 * @param {import('../../main.js').NanaiAndroidMascotApp} app
	 */
	constructor(app) {
		/** @type {import('../../main.js').NanaiAndroidMascotApp} */
		this.app = app;
		/** @type {Record<number|string, import('./surface-parser.js').CollisionArea[]>} */
		this.collisions = {};
		/** @type {Record<number|string, import('./surface-parser.js').SurfaceElement[]>} */
		this.elements = {};
		/** @type {Record<number|string, import('./surface-parser.js').SurfaceAnimation[]>} */
		this.animations = {};
		/** @type {number} */
		this.baseWidth = 200;
		/** @type {number} */
		this.baseHeight = 400;
		/** @type {Map<number, number|string>} スコープ (0=さくら / 1=うにゅ) 毎の現在サーフィスID */
		this.currentSurfaceIds = new Map([
			[0, 0],
			[1, 10],
		]);
		/** @type {Map<string, string>} */
		this.chromaKeyCache = new Map();
		/** @type {Map<string, boolean>} 着せ替えパーツのON/OFF状態 (key: scope_category_part) */
		this.dressupState = new Map();
		/** @type {Record<string, number[]>|null} surface.alias ブロックのエイリアス（Rust マニフェスト由来） */
		this.aliases = null;
		/** @type {Record<string, number[]>|null} kero.surface.alias / char1.surface.alias のエイリアス */
		this.keroAliases = null;
		/** @type {Record<string, any>|null} Rust `shell_manifest` の生マニフェスト */
		this.shellManifest = null;

		this.animationManager = new SurfaceAnimationManager(this);
	}

	get activeAnimationTimers() {
		return this.animationManager.activeAnimationTimers;
	}

	/**
	 * スコープ 0（さくら）の現在サーフィスID（互換アクセサ）
	 * @returns {number|string}
	 */
	get currentSurfaceId() {
		return this.currentSurfaceIds.get(0) ?? 0;
	}

	/**
	 * スコープ毎の現在サーフィスIDを取得 (UKADOC準拠: \0 / \1 独立)
	 * @param {number} [scopeId]
	 * @returns {number|string}
	 */
	currentSurfaceIdFor(scopeId = 0) {
		return this.currentSurfaceIds.get(scopeId) ?? (scopeId === 1 ? 10 : 0);
	}

	setSurfaceId(surfaceId, scopeId = 0) {
		// スコープ毎に独立追跡 (\0 と \1 のサーフィスを混同しない)
		this.currentSurfaceIds.set(scopeId, surfaceId);
		this.animationManager.stopAnimations(scopeId);
		this.animationManager.startAnimations(surfaceId, scopeId);
	}

	stopAnimations(scopeId = 0) {
		this.animationManager.stopAnimations(scopeId);
	}

	startAnimations(surfaceId, scopeId = 0) {
		this.animationManager.startAnimations(surfaceId, scopeId);
	}

	playAnimationPatterns(anim, baseSurfaceId, scopeId) {
		return this.animationManager.playAnimationPatterns(
			anim,
			baseSurfaceId,
			scopeId,
		);
	}

	playAnimationById(animId, scopeId = 0, waitForComplete = false) {
		return this.animationManager.playAnimationById(
			animId,
			scopeId,
			waitForComplete,
		);
	}

	/**
	 * `\![anim,pause,ID]` (SSP): サーフィスアニメーションの一時停止
	 * @param {number|string} animId
	 * @param {number} [scopeId]
	 */
	pauseAnimationById(animId, scopeId = 0) {
		this.animationManager.pauseAnimation(scopeId, animId);
	}

	/**
	 * `\![anim,resume,ID]` (SSP): アニメーションの一時停止解除
	 * @param {number|string} animId
	 * @param {number} [scopeId]
	 */
	resumeAnimationById(animId, scopeId = 0) {
		this.animationManager.resumeAnimation(scopeId, animId);
	}

	onTalkEnd(scopeId = 0) {
		this.animationManager.onTalkEnd(scopeId);
	}

	onScriptEnd(scopeId = 0) {
		this.animationManager.onScriptEnd(scopeId);
	}

	onCharSpoken(scopeId = 0) {
		this.animationManager.onCharSpoken(scopeId);
	}
}

// surfaces.txt 読み込み・当たり判定・着せ替え・合成メソッドの mixin
Object.assign(SurfaceManager.prototype, surfaceLoadMethods);
Object.assign(SurfaceManager.prototype, surfaceRenderMethods);
