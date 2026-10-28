import { AppConfig } from "../core/config.js";
import { invoke, isTauriAvailable } from "../core/tauri-helper.js";
import { ghostSurfaceMethods } from "../surface/ghost-surface.js";
import { ghostShioriMethods } from "./ghost-shiori.js";

/**
 * Nanai Android Mascot - ゴースト管理モジュール
 * (SHIORI通信は ghost-shiori.js、サーフェス表示は ghost-surface.js)
 */

/**
 * @typedef {Object} GhostInfo
 * @property {string} name
 * @property {string} [path]
 * @property {string[]} [shells]
 */

export class GhostController {
	/**
	 * @param {import('../../main.js').NanaiAndroidMascotApp} app
	 */
	constructor(app) {
		/** @type {import('../../main.js').NanaiAndroidMascotApp} */
		this.app = app;
		/** @type {GhostInfo[]} */
		this.ghosts = [];
		/** @type {GhostInfo|null} */
		this.currentGhost = null;
		/** @type {string[]} */
		this.shells = [AppConfig.paths.fallbackShellName];
		/** @type {string} */
		this.currentShell = AppConfig.paths.fallbackShellName;
		/** @type {Map<number, string>} 各スコープの最新サーフェス画像Srcキャッシュ */
		this.currentSurfaces = new Map();
		/**
		 * @type {any[] | undefined}
		 */
		this._surfaceSeq = undefined;
	}

	async autoLoadGhost() {
		console.log("🔄 自動ゴースト読み込み開始...");
		try {
			// 1. スキャンを実行して利用可能なゴースト一覧を取得
			await this.scanGhosts();

			// 2. 新規起動パラメータ (initialGhostName) または config.local.toml 由来の state.last_ghost を確認
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

	/**
	 * @param {{ path: any; name: any; }} ghostInfo
	 */
	async verifyGhostExists(ghostInfo) {
		if (!isTauriAvailable()) return false;
		try {
			const result = await invoke("scan_ghosts", {
				ghostPath: ghostInfo.path || AppConfig.paths.defaultGhostDir,
			});
			return (
				result.ghosts?.some(
					(/** @type {{ name: any; }} */ g) => g.name === ghostInfo.name,
				) || false
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
			const result = await invoke("scan_ghosts", {
				ghostPath: AppConfig.paths.defaultGhostDir,
			});
			const scanned = result.ghosts || [];

			// config.local.toml の last_ghosts 順にソート（直近ロードされたものが上位）
			const historyOrder = AppConfig.state?.last_ghosts || [];
			if (historyOrder.length > 0) {
				scanned.sort(
					(
						/** @type {{ name: string; }} */ a,
						/** @type {{ name: any; }} */ b,
					) => {
						const indexA = historyOrder.indexOf(a.name);
						const indexB = historyOrder.indexOf(b.name);
						if (indexA !== -1 && indexB !== -1) return indexA - indexB;
						if (indexA !== -1) return -1;
						if (indexB !== -1) return 1;
						return a.name.localeCompare(b.name);
					},
				);
			}

			this.ghosts = scanned;
			return this.ghosts;
		} catch (error) {
			console.error("❌ ゴーストスキャンエラー:", error);
			return this.ghosts;
		}
	}

	async scanAndLoadFirstGhost() {
		if (!isTauriAvailable()) {
			console.log(
				`Tauri環境ではありません - デフォルト${AppConfig.paths.fallbackGhostName}を使用`,
			);
			await this.selectGhost(AppConfig.paths.fallbackGhostName);
			return;
		}

		try {
			if (this.ghosts.length === 0) {
				await this.scanGhosts();
			}
			if (this.ghosts.length > 0) {
				await this.selectGhost(this.ghosts[0].name);
			} else {
				await this.selectGhost(AppConfig.paths.fallbackGhostName);
			}
		} catch (error) {
			console.error("❌ ゴーストスキャンエラー:", error);
			await this.selectGhost(AppConfig.paths.fallbackGhostName);
		}
	}

	/**
	 * @param {string} ghostName
	 */
	selectGhost(ghostName) {
		const ghost = this.ghosts.find((g) => g.name === ghostName) || {
			name: ghostName,
			path: `${AppConfig.paths.defaultGhostDir}/${ghostName}`,
		};

		// 切り替え中に完了した旧ゴーストの読み込みがバナーや会話を操作しないようにする
		this._ghostLoadGeneration = (this._ghostLoadGeneration ?? 0) + 1;
		const generation = this._ghostLoadGeneration;
		this.clearSurfaceAssetCache();
		for (const scope of Object.keys(this._surfaceSeq ?? {})) {
			this._surfaceSeq[scope]++;
		}
		this.currentGhost = ghost;
		// 検出されたシェル一覧を同期
		if (ghost.shells && ghost.shells.length > 0) {
			this.shells = ghost.shells.map(
				(/** @type {{ name: any; }} */ s) => s.name,
			);
		} else {
			this.shells = [AppConfig.paths.fallbackShellName];
		}
		this.currentShell = this.shells[0] || AppConfig.paths.fallbackShellName;

		this.updateCurrentGhostDisplay();
		localStorage.setItem(
			AppConfig.storageKeys.lastGhost,
			JSON.stringify(ghost),
		);
		// メニュー「最近使ったもの」履歴に記録
		this.app?.recordRecentGhost?.(ghost.name);

		// Rustバックエンド（config.local.toml）へ読み込み履歴を永続化
		if (isTauriAvailable()) {
			invoke("record_ghost_loaded", { ghostName }).catch((err) => {
				console.warn("⚠️ record_ghost_loaded failed:", err);
			});
		}

		// 起動時・処理中ステータスバナーを表示（SSP/MATERIA風・メニュー反対側下部）
		const bannerPromise = isTauriAvailable()
			? invoke("show_loading_banner_window", {
					ghostName: ghost.name,
					ghostVersion: ghost.version || "不明",
				}).catch((error) => {
					console.warn("⚠️ 処理中バナーを表示できません:", error);
				})
			: Promise.resolve();

		// アセット読み込みゲート: surfaces.txtのパースと初期サーフィス画像生成を両方完了させる
		const surfacesTxtPromise = this.app.surfaceManager.loadSurfacesTxt(
			ghost.path || `${AppConfig.paths.defaultGhostDir}/${ghostName}`,
			this.currentShell,
		);
		const characterPromise = this.updateGhostCharacter(ghostName);
		const readinessGate = Promise.all([
			bannerPromise,
			surfacesTxtPromise,
			characterPromise,
		]);

		const startup = this.initializeGhostSHIORI(
			ghost,
			readinessGate,
			() => this._ghostLoadGeneration === generation,
		);

		// ゴースト連動のバルーン自動切り替え（設定が有効な場合、デフォルト有効）
		if (this.app.settings?.autoSwitchBalloonWithGhost !== false) {
			this.app.setBalloonTheme?.(this.app.settings?.balloonTheme || "default");
		}
		// メニュー側の選択状態表示（✓マーク等）を最新状態に同期
		this.app.syncMenuGhosts?.();
		return startup;
	}
	/**
	 * @param {string} shellName
	 */
	selectShell(shellName) {
		this.currentShell = shellName;
		const ghostName =
			this.currentGhost?.name || AppConfig.paths.fallbackGhostName;
		const ghostPath =
			this.currentGhost?.path ||
			`${AppConfig.paths.defaultGhostDir}/${ghostName}`;
		console.log(`👗 シェル切り替え: ${shellName}`);

		this.updateSurface(0, 0);
		this.app.surfaceManager.loadSurfacesTxt(`${ghostPath}/shell/${shellName}`);
		this.sendShioriEvent("OnShellChanged", [shellName]);

		// メニュー側の選択状態表示（✓マーク等）を最新状態に同期
		this.app.syncMenuGhosts?.();
	}
}

Object.assign(
	GhostController.prototype,
	ghostShioriMethods,
	ghostSurfaceMethods,
);
