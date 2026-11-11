import { SurfaceAnimationManager } from "./surface-animation-manager.js";
import { surfaceLoadMethods } from "./surface-load.js";
import { surfaceRenderMethods } from "./surface-render.js";

/**
 * Nanai Android Mascot - surfaces.txt パーサー & 当たり判定（Collision）マネージャー
 */
export class SurfaceManager {
	setScale(scaleX: number, scaleY: number, scope: number) {
		throw new Error("Method not implemented.");
	}
	setAlpha(clampedAlpha: number, scope: number) {
		throw new Error("Method not implemented.");
	}
	setPosition(x: number, y: number, scope: number) {
		throw new Error("Method not implemented.");
	}
	bindDressup(_category: string, _part: unknown, _arg2: string, _scopeId: number) {
		throw new Error("Method not implemented.");
	}
	detectCollision(
		_clientX: number,
		_clientY: number,
		_rect: {},
		_arg3: null,
		_scopeId: number,
	) {
		throw new Error("Method not implemented.");
	}
	// mixin (surfaceLoadMethods) で注入されるメソッドの型宣言
	declare loadSurfacesTxt: (
		ghostPath: string,
		shellName?: string,
	) => Promise<void>;

	app: unknown;
	collisions: Record<number | string, unknown[]>;
	elements: Record<number | string, unknown[]>;
	animations: Record<number | string, unknown[]>;
	baseWidth: number;
	baseHeight: number;
	currentSurfaceIds: Map<number, number | string>;
	chromaKeyCache: Map<string, string>;
	dressupState: Map<string, boolean>;
	dressupStateVersion: number;
	aliases: Record<string, number[]> | null;
	keroAliases: Record<string, number[]> | null;
	shellManifest: Record<string, unknown> | null;
	planCache: Map<string, unknown>;
	baseCanvasCache: Map<string, HTMLCanvasElement>;
	animationManager: SurfaceAnimationManager;

	constructor(app: unknown) {
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
		this.dressupStateVersion = 0;
		this.dressupState = new Map();

		const originalSet = this.dressupState.set.bind(this.dressupState);
		this.dressupState.set = (key: string, value: boolean) => {
			this.dressupStateVersion++;
			return originalSet(key, value);
		};
		const originalDelete = this.dressupState.delete.bind(this.dressupState);
		this.dressupState.delete = (key: string) => {
			this.dressupStateVersion++;
			return originalDelete(key);
		};
		const originalClear = this.dressupState.clear.bind(this.dressupState);
		this.dressupState.clear = () => {
			this.dressupStateVersion++;
			originalClear();
		};

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
		anim: unknown,
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

	isBindAnimationActive(
		scopeId: number = 0,
		animId: number | string | null = null,
		_surfaceId: number | string | null = null,
	): boolean {
		const targetId = Number(animId);
		if (Number.isNaN(targetId)) return false;
		const ids: number[] =
			typeof (
				this as unknown as { activeBindAnimationIds?: (s: number) => number[] }
			).activeBindAnimationIds === "function"
				? ((
						this as unknown as {
							activeBindAnimationIds: (s: number) => number[];
						}
					).activeBindAnimationIds(scopeId) ?? [])
				: [];
		return ids.includes(targetId);
	}
}

Object.assign(SurfaceManager.prototype, surfaceLoadMethods);
Object.assign(SurfaceManager.prototype, surfaceRenderMethods);
