import { AppConfig } from "../core/config.js";
import { invoke, isTauriAvailable } from "../core/tauri-helper.js";
import { ghostSurfaceMethods } from "../surface/ghost-surface.js";
import { ghostShioriMethods } from "./ghost-shiori.js";

export interface GhostInfo {
	name: string;
	path?: string;
	shells?: string[];
	[key: string]: unknown;
}

export class GhostController {
	// mixin (Object.assign) で後から注入されるメソッド・プロパティの型宣言
	declare sendShioriEvent: (
		event: string,
		args?: unknown[],
	) => Promise<unknown>;
	declare sendBalloonTimeoutNotify?: (
		script: string,
		scope?: string | number,
	) => Promise<unknown>;
	declare sendBalloonCloseNotify?: (
		script: string,
		scopeId?: number | string,
	) => Promise<unknown>;
	declare sendBalloonBreakNotify?: (
		script?: string,
		scopeId?: number | string,
		charPosition?: number | string,
	) => Promise<unknown>;
	declare stopSecondChangeTimer?: () => void;
	declare callGhost?: (name: string) => Promise<unknown>;
	declare evaluateProperty?: (prop: string) => Promise<unknown>;
	declare sendGhostChanging?: (
		targetGhost: string,
		fromGhost: string,
		mode?: string,
	) => Promise<unknown>;
	declare sendGhostChanged?: (
		targetGhost: string,
		fromGhost: string,
	) => Promise<unknown>;
	declare sendShellChanging?: (
		targetShell: string,
		fromShell: string,
	) => Promise<unknown>;
	declare sendShellChanged?: (
		targetShell: string,
		fromShell: string,
	) => Promise<unknown>;
	declare sendRaiseOther?: (
		ghost: string,
		event: string,
		refs: string[],
	) => Promise<unknown>;
	declare sendNotifyOther?: (
		ghost: string,
		event: string,
		refs: string[],
	) => Promise<unknown>;
	declare sendShioriNotify?: (
		event: string,
		refs?: unknown[],
	) => Promise<unknown>;
	declare closeGhost?: () => Promise<unknown>;
	declare selectShell?: (shellName: string) => Promise<unknown>;
	declare selectGhost?: (ghostName: string) => Promise<unknown>;
	declare setScopeMoveOffset?: (scope: number, x: number, y: number) => void;
	declare sendTeachInput?: (input: string) => Promise<unknown>;
	declare clearTeachHistory?: () => void;
	declare initializeGhostSHIORI: (
		ghost: GhostInfo,
		preload?: unknown,
		isCurrent?: unknown,
	) => Promise<unknown>;
	declare loadSurfaceAsset: (
		cmd: string,
		ghostPath: string,
		shell: string,
		id: number | string,
	) => Promise<string>;
	declare updateSurface: (
		surfaceId: number | string,
		scopeId?: number,
		extraLayers?: unknown[] | null,
	) => Promise<unknown>;
	declare username?: string;
	declare lastGhostName?: string;
	declare lastObjectName?: string;

	app: import("../../main.js").NanaiAndroidMascotApp;
	ghosts: GhostInfo[];
	currentGhost: GhostInfo | null;
	shells: string[];
	currentShell: string;
	currentSurfaces: Map<number, string>;
	_surfaceSeq: unknown[] | undefined;
	uptimeSeconds?: number;
	_secondTimerId?: unknown;
	_secondSending?: boolean;
	_previousGhostName?: string;
	_currentLoadToken?: unknown;
	[key: string]: unknown;

	constructor(app: import("../../main.js").NanaiAndroidMascotApp) {
		this.app = app;
		this.ghosts = [];
		this.currentGhost = null;
		this.shells = [AppConfig.paths.fallbackShellName];
		this.currentShell = AppConfig.paths.fallbackShellName;
		this.currentSurfaces = new Map();
		this._surfaceSeq = undefined;
	}

	async autoLoadGhost() {
		console.log("🔄 自動ゴースト読み込み開始...");
		try {
			await this.scanGhosts();

			const targetGhostName =
				this.app.initialGhostName ||
				AppConfig.state?.last_ghost ||
				(localStorage.getItem(AppConfig.storageKeys.lastGhost)
					? JSON.parse(
							localStorage.getItem(AppConfig.storageKeys.lastGhost) || "{}",
						)?.name
					: null);

			if (targetGhostName) {
				const found = this.ghosts.find((g) => g.name === targetGhostName);
				if (found) {
					console.log(`🎯 前回選択されたゴーストをロード: ${targetGhostName}`);
					await this.selectGhost(targetGhostName);
					return;
				}
			}

			await this.scanAndLoadFirstGhost();
		} catch (error) {
			console.error("❌ 自動ゴースト読み込みエラー:", error);
			await this.selectGhost(AppConfig.paths.fallbackGhostName);
		}
	}

	async verifyGhostExists(ghostInfo: GhostInfo): Promise<boolean> {
		if (!isTauriAvailable()) return false;
		try {
			const result = await invoke<{ ghosts?: GhostInfo[] }>("scan_ghosts", {
				ghostPath: ghostInfo.path || AppConfig.paths.defaultGhostDir,
			});
			return (
				result?.ghosts?.some((g: GhostInfo) => g.name === ghostInfo.name) ||
				false
			);
		} catch (error) {
			console.error("ゴースト存在確認エラー:", error);
			return false;
		}
	}

	async scanGhosts() {
		if (!isTauriAvailable()) {
			return this.ghosts;
		}
		try {
			const result = await invoke<{ ghosts?: GhostInfo[] }>("scan_ghosts", {
				ghostPath: AppConfig.paths.defaultGhostDir,
			});
			if (result && Array.isArray(result.ghosts)) {
				this.ghosts = result.ghosts;
			}
		} catch (e) {
			console.error("ゴーストスキャン失敗:", e);
		}
		return this.ghosts;
	}

	async scanAndLoadFirstGhost() {
		if (this.ghosts.length > 0) {
			await this.selectGhost(this.ghosts[0].name);
		} else {
			await this.selectGhost(AppConfig.paths.fallbackGhostName);
		}
	}

	async selectGhost(ghostName: string) {
		const prevGhostName = this.currentGhost?.name || "";
		const ghost = this.ghosts.find((g) => g.name === ghostName) || {
			name: ghostName,
			path: `${AppConfig.paths.defaultGhostDir}/${ghostName}`,
		};

		if (prevGhostName && prevGhostName !== ghost.name && this.sendShioriEvent) {
			try {
				await this.sendShioriEvent("OnGhostChanging", [
					ghost.name,
					"manual",
					prevGhostName,
				]);
			} catch (_e) {}
		}

		const startTime = Date.now();

		// 【フェーズ 1: プリロードバナー表示 (完全待機)】
		if (isTauriAvailable()) {
			try {
				await invoke("show_loading_banner_window", { ghostName: ghost.name });
			} catch (_e) {}
		}

		// バックグラウンドアセット先行プリロード
		const preloadSurfacesPromise = this.app.surfaceManager?.loadSurfacesTxt?.(
			ghost.path ?? "",
		);

		try {
			localStorage.setItem(
				AppConfig.storageKeys.lastGhost,
				JSON.stringify({ name: ghost.name }),
			);
		} catch (_e) {}

		this.currentGhost = ghost;

		if (isTauriAvailable()) {
			try {
				const info = await invoke<{
					shells?: unknown[];
					recommended_balloon?: string;
				}>("get_ghost_info", {
					ghostName: ghost.name,
				});
				if (info) {
					if (Array.isArray(info.shells) && info.shells.length > 0) {
						this.shells = info.shells.map((s: unknown) =>
							typeof s === "object" && s !== null && "name" in s
								? (s as { name: string }).name
								: String(s),
						);
					}
					// 一旦、読み込んだゴーストのバルーンを使用する形にする
					if (info.recommended_balloon) {
						await this.app.setBalloonTheme?.(info.recommended_balloon);
					}
				}
			} catch (_e) {
				this.shells = [AppConfig.paths.fallbackShellName];
			}
		}

		this.currentShell = this.shells[0] || AppConfig.paths.fallbackShellName;

		// 【フェーズ 2: シェル表示 & SHIORI 初期化のパラレル実行 (Atomic Reveal)】
		const loadId = {};
		this._currentLoadToken = loadId;
		const isCurrentLoad = () => this._currentLoadToken === loadId;

		await Promise.all([
			Promise.resolve(preloadSurfacesPromise)
				.catch(() => {})
				.then(() => this.selectShell(this.currentShell)),
			this.initializeGhostSHIORI(ghost, preloadSurfacesPromise, isCurrentLoad),
		]);

		// レンダリングフレーム完了の待機 (トリプル rAF による GPU 描画・コンポジット完全確定。テスト環境フォールバック付)
		if (typeof globalThis.requestAnimationFrame === "function") {
			await new Promise((resolve) =>
				requestAnimationFrame(() =>
					requestAnimationFrame(() => requestAnimationFrame(resolve)),
				),
			);
		} else {
			await new Promise((resolve) => setTimeout(resolve, 50));
		}

		// 最小バナー表示維持時間 (チラつき防止を強化)
		const elapsed = Date.now() - startTime;
		if (elapsed < 800) {
			await new Promise((resolve) => setTimeout(resolve, 800 - elapsed));
		}

		// アトミック反映完了後にバナー非表示化 (完全待機)
		if (isTauriAvailable()) {
			try {
				await invoke("hide_loading_banner_window");
			} catch (_e) {}
		}
	}

	async selectShell(shellName: string) {
		const prevShell = this.currentShell || "";
		this.currentShell = shellName;
		if (this.currentGhost) {
			try {
				await this.loadSurfaceAsset(
					"load_surface_image",
					this.currentGhost.path || AppConfig.paths.defaultGhostDir,
					shellName,
					0,
				);
			} catch (_e) {}
			await this.updateSurface(0, 0);
			await this.updateSurface(10, 1);
			if (prevShell && prevShell !== shellName && this.sendShioriEvent) {
				try {
					await this.sendShioriEvent("OnShellChanged", [shellName, prevShell]);
				} catch (_e) {}
			}
		}
	}
}

Object.assign(GhostController.prototype, ghostShioriMethods);
Object.assign(GhostController.prototype, ghostSurfaceMethods);
