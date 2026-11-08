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
			const sX = (globalThis as unknown).screenX ?? 0;
			const sY = (globalThis as unknown).screenY ?? 0;
			const posX = screenX !== null ? screenX : sX + 200;
			const posY = screenY !== null ? screenY : sY + 100;

			invoke("show_menu_window", { x: posX, y: posY, scope })
				.then(() => (this as unknown).syncMenuGhosts(scope))
				.catch((err) => {
					console.warn(
						"show_menu_window failed, fallback to show_context_menu:",
						err,
					);
					const gc = (this as unknown).ghostController;
					invoke("show_context_menu", {
						ghosts: (gc.ghosts || []).map((g: unknown) => g.name),
						currentGhost: gc.currentGhost?.name || null,
						shells: gc.shells || ["master"],
						currentShell: gc.currentShell || "master",
					}).catch(() => (this as unknown).toggleHtmlMenu(scope));
				});
			return;
		}
		(this as unknown).toggleHtmlMenu(scope);
	},

	toggleHtmlMenu(scope: number = 0) {
		if (!(this as unknown).elements.menuContainer) return;
		const isVisible =
			(this as unknown).elements.menuContainer.style.display !== "none";
		const nextState = isVisible ? "none" : "block";
		(this as unknown).elements.menuContainer.style.display = nextState;
		if (nextState === "block") {
			(this as unknown).syncMenuGhosts(scope);
		}
	},

	syncMenuGhosts(scope: number = 0) {
		const gc = (this as unknown).ghostController;
		const shellNames = gc.shells || ["master"];
		const currentShellName = gc.currentShell || "master";
		const ghosts = gc.ghosts || [{ name: AppConfig.paths.fallbackGhostName }];
		const fullShells = gc.currentGhost?.shells || shellNames;

		const dressup = dressupMenuPayload(
			(this as unknown).surfaceManager?.shellManifest,
			(this as unknown).surfaceManager,
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
				captions: (this as unknown).cachedMenuCaptions || {},
			});
			emit("sync-theme", (this as unknown).currentBalloonTheme);
			if ((this as unknown).availableBalloons) {
				emit("sync-balloons", (this as unknown).availableBalloons);
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
					captions: (this as unknown).cachedMenuCaptions || {},
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
				{ type: "sync-theme", theme: (this as unknown).currentBalloonTheme },
				"*",
			);
			if ((this as unknown).availableBalloons) {
				win.postMessage(
					{
						type: "sync-balloons",
						balloons: (this as unknown).availableBalloons,
					},
					"*",
				);
			}
		}
	},

	hideMenu() {
		if ((this as unknown).elements.menuContainer) {
			(this as unknown).elements.menuContainer.style.display = "none";
		}
		(this as unknown).hideQuickActionsPanel();
	},

	toggleQuickActionsPanel() {
		if (!(this as unknown).elements.quickActionsPanel) return;
		const isVisible =
			(this as unknown).elements.quickActionsPanel.style.display !== "none";
		(this as unknown).elements.quickActionsPanel.style.display = isVisible
			? "none"
			: "flex";
	},

	hideQuickActionsPanel() {
		if ((this as unknown).elements.quickActionsPanel) {
			(this as unknown).elements.quickActionsPanel.style.display = "none";
		}
	},
};
