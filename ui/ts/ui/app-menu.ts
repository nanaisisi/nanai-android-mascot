import { AppConfig } from "../core/config.js";
import { emit, invoke, isTauriAvailable } from "../core/tauri-helper.js";
import { dressupMenuPayload } from "../surface/bind-menu.js";

/** メニュー/クイックパネル関連メソッド (NanaiAndroidMascotApp に mixin) */
export const menuMethods = {
	toggleMenu(
		screenX: number | null = null,
		screenY: number | null = null,
		scope: number = 0,
	) {
		if (isTauriAvailable()) {
			const sX = (globalThis as any).screenX ?? 0;
			const sY = (globalThis as any).screenY ?? 0;
			const posX = screenX !== null ? screenX : sX + 200;
			const posY = screenY !== null ? screenY : sY + 100;

			invoke("show_menu_window", { x: posX, y: posY, scope })
				.then(() => (this as any).syncMenuGhosts(scope))
				.catch((err) => {
					console.warn(
						"show_menu_window failed, fallback to show_context_menu:",
						err,
					);
					const gc = (this as any).ghostController;
					invoke("show_context_menu", {
						ghosts: (gc.ghosts || []).map((g: any) => g.name),
						currentGhost: gc.currentGhost?.name || null,
						shells: gc.shells || ["master"],
						currentShell: gc.currentShell || "master",
					}).catch(() => (this as any).toggleHtmlMenu(scope));
				});
			return;
		}
		(this as any).toggleHtmlMenu(scope);
	},

	toggleHtmlMenu(scope: number = 0) {
		if (!(this as any).elements.menuContainer) return;
		const isVisible =
			(this as any).elements.menuContainer.style.display !== "none";
		const nextState = isVisible ? "none" : "block";
		(this as any).elements.menuContainer.style.display = nextState;
		if (nextState === "block") {
			(this as any).syncMenuGhosts(scope);
		}
	},

	syncMenuGhosts(scope: number = 0) {
		const gc = (this as any).ghostController;
		const shellNames = gc.shells || ["master"];
		const currentShellName = gc.currentShell || "master";
		const ghosts = gc.ghosts || [{ name: AppConfig.paths.fallbackGhostName }];
		const fullShells = gc.currentGhost?.shells || shellNames;

		const dressup = dressupMenuPayload(
			(this as any).surfaceManager?.shellManifest,
			(this as any).surfaceManager,
		);

		let recentGhosts: string[] = [];
		try {
			recentGhosts = JSON.parse(
				localStorage.getItem("nanai_recent_ghosts") || "[]",
			);
		} catch (_err) {}

		if (isTauriAvailable()) {
			emit("sync-ghosts", {
				ghosts,
				currentGhost: gc.currentGhost?.name || gc.currentGhost,
				shells: fullShells,
				currentShell: currentShellName,
				scope,
				dressup,
				recentGhosts,
				captions: (this as any).cachedMenuCaptions || {},
			});
			emit("sync-theme", (this as any).currentBalloonTheme);
			if ((this as any).availableBalloons) {
				emit("sync-balloons", (this as any).availableBalloons);
			}
		}

		const win = (document.getElementById("menu-iframe") as HTMLIFrameElement)
			?.contentWindow;
		if (win) {
			win.postMessage({ type: "sync-scope", scope }, "*");
			win.postMessage(
				{
					type: "sync-ghosts",
					ghosts,
					currentGhost: gc.currentGhost,
					scope,
					dressup,
					recentGhosts,
					captions: (this as any).cachedMenuCaptions || {},
				},
				"*",
			);
			win.postMessage(
				{
					type: "sync-shells",
					shells: fullShells,
					currentShell: currentShellName,
				},
				"*",
			);
			win.postMessage(
				{ type: "sync-theme", theme: (this as any).currentBalloonTheme },
				"*",
			);
			if ((this as any).availableBalloons) {
				win.postMessage(
					{ type: "sync-balloons", balloons: (this as any).availableBalloons },
					"*",
				);
			}
		}
	},

	hideMenu() {
		if ((this as any).elements.menuContainer) {
			(this as any).elements.menuContainer.style.display = "none";
		}
		(this as any).hideQuickActionsPanel();
	},

	toggleQuickActionsPanel() {
		if (!(this as any).elements.quickActionsPanel) return;
		const isVisible =
			(this as any).elements.quickActionsPanel.style.display !== "none";
		(this as any).elements.quickActionsPanel.style.display = isVisible
			? "none"
			: "flex";
	},

	hideQuickActionsPanel() {
		if ((this as any).elements.quickActionsPanel) {
			(this as any).elements.quickActionsPanel.style.display = "none";
		}
	},
};
