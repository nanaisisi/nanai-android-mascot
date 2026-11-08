import { SurfaceAnimationManager } from "./surface-animation-manager.js";
import { surfaceLoadMethods } from "./surface-load.js";
import { surfaceRenderMethods } from "./surface-render.js";

/**
 * Nanai Android Mascot - surfaces.txt パーサー & 当たり判定（Collision）マネージャー
 */
export class SurfaceManager {
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	app: any;
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	collisions: Record<number | string, any[]>;
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	elements: Record<number | string, any[]>;
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	animations: Record<number | string, any[]>;
	baseWidth: number;
	baseHeight: number;
	currentSurfaceIds: Map<number, number | string>;
	chromaKeyCache: Map<string, string>;
	dressupState: Map<string, boolean>;
	aliases: Record<string, number[]> | null;
	keroAliases: Record<string, number[]> | null;
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	shellManifest: Record<string, any> | null;
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	planCache: Map<string, any>;
	baseCanvasCache: Map<string, HTMLCanvasElement>;
	animationManager: SurfaceAnimationManager;

	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	constructor(app: any) {
		this.app = app;
		this.collisions = {};
		this.elements = {};
		this.animations = {};
		this.baseWidth = 200;
		this.baseHeight = 400;
		this.currentSurfaceIds = new Map([
			[0, 0],
			[1, 10],
		]);
		this.chromaKeyCache = new Map();
		this.dressupState = new Map();
		this.aliases = null;
		this.keroAliases = null;
		this.shellManifest = null;
		this.planCache = new Map();
		this.baseCanvasCache = new Map();

		this.animationManager = new SurfaceAnimationManager(this);
	}

	get activeAnimationTimers() {
		return this.animationManager.activeAnimationTimers;
	}

	get currentSurfaceId() {
		return this.currentSurfaceIds.get(0) ?? 0;
	}

	currentSurfaceIdFor(scopeId: number = 0): number | string {
		return this.currentSurfaceIds.get(scopeId) ?? (scopeId === 1 ? 10 : 0);
	}

	setSurfaceId(surfaceId: number | string, scopeId: number = 0) {
		this.currentSurfaceIds.set(scopeId, surfaceId);
		this.animationManager.stopAnimations(scopeId);
		this.animationManager.startAnimations(surfaceId, scopeId);
	}

	stopAnimations(scopeId: number = 0) {
		this.animationManager.stopAnimations(scopeId);
	}

	startAnimations(surfaceId: number | string, scopeId: number = 0) {
		this.animationManager.startAnimations(surfaceId, scopeId);
	}

	playAnimationPatterns(
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		anim: any,
		baseSurfaceId: number | string,
		scopeId: number,
	) {
		return this.animationManager.playAnimationPatterns(
			anim,
			baseSurfaceId,
			scopeId,
		);
	}

	playAnimationById(
		animId: number | string,
		scopeId: number = 0,
		waitForComplete: boolean = false,
	) {
		return this.animationManager.playAnimationById(
			animId,
			scopeId,
			waitForComplete,
		);
	}

	pauseAnimationById(animId: number | string, scopeId: number = 0) {
		this.animationManager.pauseAnimation(scopeId, animId);
	}

	resumeAnimationById(animId: number | string, scopeId: number = 0) {
		this.animationManager.resumeAnimation(scopeId, animId);
	}

	stopAnimationById(animId: number | string, scopeId: number = 0) {
		this.animationManager.stopAnimation(scopeId, animId);
	}

	setAnimationOffset(
		animId: number | string,
		x: number = 0,
		y: number = 0,
		scopeId: number = 0,
	) {
		this.animationManager.setAnimationOffset(scopeId, animId, x, y);
	}

	setBaseMoveOffset(scopeId: number = 0, x: number = 0, y: number = 0) {
		this.animationManager.setBaseMoveOffset(scopeId, x, y);
	}

	getBaseMoveOffset(scopeId: number = 0) {
		return this.animationManager.getBaseMoveOffset(scopeId);
	}

	waitForAnimation(animId: number | string, scopeId: number = 0) {
		return this.animationManager.waitForAnimation(animId, scopeId);
	}

	onTalkEnd(scopeId: number = 0) {
		this.animationManager.onTalkEnd(scopeId);
	}

	onScriptEnd(scopeId: number = 0) {
		this.animationManager.onScriptEnd(scopeId);
	}

	onCharSpoken(scopeId: number = 0) {
		this.animationManager.onCharSpoken(scopeId);
	}
}

Object.assign(SurfaceManager.prototype, surfaceLoadMethods);
Object.assign(SurfaceManager.prototype, surfaceRenderMethods);
