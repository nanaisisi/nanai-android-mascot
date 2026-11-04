import { AppConfig } from "../core/config.js";
import { invoke, isTauriAvailable } from "../core/tauri-helper.js";
import { ghostSurfaceMethods } from "../surface/ghost-surface.js";
import { ghostShioriMethods } from "./ghost-shiori.js";

export interface GhostInfo {
	name: string;
	path?: string;
	shells?: string[];
	[key: string]: any;
}

export class GhostController {
	app: any;
	ghosts: GhostInfo[];
	currentGhost: GhostInfo | null;
	shells: string[];
	currentShell: string;
	currentSurfaces: Map<number, string>;
	_surfaceSeq: any[] | undefined;
	uptimeSeconds?: number;
	_secondTimerId?: any;
	_secondSending?: boolean;

	constructor(app: any) {
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
			const result: any = await invoke("scan_ghosts", {
				ghostPath: ghostInfo.path || AppConfig.paths.defaultGhostDir,
			});
			return (
				result.ghosts?.some(
					(g: GhostInfo) => g.name === ghostInfo.name,
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
			const result: any = await invoke("scan_ghosts", {
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
		const ghost = this.ghosts.find((g) => g.name === ghostName) || {
			name: ghostName,
			path: `${AppConfig.paths.defaultGhostDir}/${ghostName}`,
		};
		this.currentGhost = ghost;

		try {
			localStorage.setItem(
				AppConfig.storageKeys.lastGhost,
				JSON.stringify({ name: ghost.name }),
			);
		} catch (_e) {}

		if (isTauriAvailable()) {
			try {
				const info: any = await invoke("get_ghost_info", { ghostName: ghost.name });
				if (info && Array.isArray(info.shells) && info.shells.length > 0) {
					this.shells = info.shells;
				}
			} catch (_e) {
				this.shells = [AppConfig.paths.fallbackShellName];
			}
		}

		this.currentShell = this.shells[0] || AppConfig.paths.fallbackShellName;
		await this.selectShell(this.currentShell);
	}

	async selectShell(shellName: string) {
		this.currentShell = shellName;
		if (this.currentGhost) {
			try {
				await (this as any).loadSurfaceAsset("load_surface_image", this.currentGhost.path || AppConfig.paths.defaultGhostDir, shellName, 0);
			} catch (_e) {}
			await (this as any).updateSurface(0, 0);
			await (this as any).updateSurface(10, 1);
		}
	}
}

Object.assign(GhostController.prototype, ghostShioriMethods);
Object.assign(GhostController.prototype, ghostSurfaceMethods);
