import { AppConfig } from "./config.js";
import { ghostShioriMethods } from "./ghost-shiori.js";
import { ghostSurfaceMethods } from "./ghost-surface.js";
import { invoke, isTauriAvailable } from "./tauri-helper.js";

/**
 * Nanai Android Mascot - ゴースト管理モジュール
 * (SHIORI通信は ghost-shiori.js、サーフェス表示は ghost-surface.js)
 */

export class GhostController {
	constructor(app) {
		this.app = app;
		this.ghosts = [];
		this.currentGhost = null;
		this.shells = [AppConfig.paths.fallbackShellName];
		this.currentShell = AppConfig.paths.fallbackShellName;
	}

	async autoLoadGhost() {
		console.log("🔄 自動ゴースト読み込み開始...");
		try {
			// 1. スキャンを実行して利用可能なゴースト一覧を取得
			await this.scanGhosts();

			// 2. config.local.toml 由来の state.last_ghost を確認
			const configLastGhost = AppConfig.state?.last_ghost;
			const savedGhost = localStorage.getItem(AppConfig.storageKeys.lastGhost);
			const targetGhostName =
				configLastGhost || (savedGhost ? JSON.parse(savedGhost)?.name : null);

			if (targetGhostName) {
				const found = this.ghosts.find((g) => g.name === targetGhostName);
				if (found) {
					console.log(`🎯 前回選択されたゴーストをロード: ${targetGhostName}`);
					this.selectGhost(targetGhostName);
					return;
				}
			}

			await this.scanAndLoadFirstGhost();
		} catch (error) {
			console.error("❌ 自動ゴースト読み込みエラー:", error);
			this.selectGhost(AppConfig.paths.fallbackGhostName);
		}
	}

	async verifyGhostExists(ghostInfo) {
		if (!isTauriAvailable()) return false;
		try {
			const result = await invoke("scan_ghosts", {
				ghostPath: ghostInfo.path || AppConfig.paths.defaultGhostDir,
			});
			return result.ghosts?.some((g) => g.name === ghostInfo.name) || false;
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
				scanned.sort((a, b) => {
					const indexA = historyOrder.indexOf(a.name);
					const indexB = historyOrder.indexOf(b.name);
					if (indexA !== -1 && indexB !== -1) return indexA - indexB;
					if (indexA !== -1) return -1;
					if (indexB !== -1) return 1;
					return a.name.localeCompare(b.name);
				});
			}

			this.ghosts = scanned;
			this.syncWithMenu();
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
			this.selectGhost(AppConfig.paths.fallbackGhostName);
			return;
		}

		try {
			if (this.ghosts.length === 0) {
				await this.scanGhosts();
			}
			if (this.ghosts.length > 0) {
				this.selectGhost(this.ghosts[0].name);
			} else {
				this.selectGhost(AppConfig.paths.fallbackGhostName);
			}
		} catch (error) {
			console.error("❌ ゴーストスキャンエラー:", error);
			this.selectGhost(AppConfig.paths.fallbackGhostName);
		}
	}

	selectGhost(ghostName) {
		const ghost = this.ghosts.find((g) => g.name === ghostName) || {
			name: ghostName,
			path: `${AppConfig.paths.defaultGhostDir}/${ghostName}`,
		};

		this.currentGhost = ghost;
		// 検出されたシェル一覧を同期
		if (ghost.shells && ghost.shells.length > 0) {
			this.shells = ghost.shells.map((s) => s.name);
		} else {
			this.shells = [AppConfig.paths.fallbackShellName];
		}
		this.currentShell = this.shells[0] || AppConfig.paths.fallbackShellName;

		this.updateCurrentGhostDisplay();
		this.updateGhostCharacter(ghostName);
		localStorage.setItem(
			AppConfig.storageKeys.lastGhost,
			JSON.stringify(ghost),
		);

		// Rustバックエンド（config.local.toml）へ読み込み履歴を永続化
		if (isTauriAvailable()) {
			invoke("record_ghost_loaded", { ghostName }).catch((err) => {
				console.warn("⚠️ record_ghost_loaded failed:", err);
			});
		}

		this.initializeGhostSHIORI(ghost);
		this.app.surfaceManager.loadSurfacesTxt(
			ghost.path || `${AppConfig.paths.defaultGhostDir}/${ghostName}`,
			this.currentShell,
		);

		// ゴースト連動のバルーン自動切り替え（設定が有効な場合、デフォルト有効）
		if (this.app.settings?.autoSwitchBalloonWithGhost !== false) {
			if (ghostName.includes("Emily") || ghostName.includes("emily")) {
				this.app.setBalloonTheme?.("emily4");
			} else {
				this.app.setBalloonTheme?.(this.app.settings?.balloonTheme || "default");
			}
		}
	}

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
	}
}

Object.assign(
	GhostController.prototype,
	ghostShioriMethods,
	ghostSurfaceMethods,
);
