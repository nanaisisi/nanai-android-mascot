import {
	invoke,
	isTauriAvailable,
	listen,
} from "../core/tauri-helper.js";
import type { MenuDispatcher } from "./menu-dispatcher.js";
import type { MenuSubmenuRenderer } from "./menu-submenu-renderer.js";

export function setupContextMenuSync(
	dispatcher: MenuDispatcher,
	renderer: MenuSubmenuRenderer,
) {
	if (isTauriAvailable()) {
		listen("sync-menu-scope", (event) => {
			const scope =
				typeof event.payload === "number"
					? event.payload
					: parseInt(event.payload, 10);
			if (!Number.isNaN(scope)) {
				dispatcher.setScope(scope);
				renderer.renderDressupSubmenu(null, scope);
				dispatcher.dispatchAction("request-sync");
			}
		});
		listen("sync-ghosts", (event) => {
			const data = event.payload;
			if (data) {
				if (
					typeof data.scope === "number" &&
					data.scope !== dispatcher.currentScope
				) {
					dispatcher.setScope(data.scope);
				}
				renderer.renderGhostSubmenu(data.ghosts || [], data.currentGhost);
				renderer.renderCallGhostSubmenu(data.ghosts || []);
				if (data.shells) {
					renderer.renderShellSubmenu(data.shells, data.currentShell);
				}
				if (data.dressup) {
					renderer.renderDressupSubmenu(
						data.dressup,
						data.scope ?? dispatcher.currentScope,
					);
				}
				renderer.renderRecentSubmenu(data.recentGhosts || []);
				const activeShell =
					data.shells?.find(
						(s: { name: unknown }) => s.name === data.currentShell,
					) || data.shells?.[0];
				renderer.applyShellTheme(activeShell);
				if (data.captions) {
					renderer.applyCaptions(data.captions);
				}
			}
		});
		listen("sync-menu-captions", (event) => {
			if (event.payload) {
				renderer.applyCaptions(event.payload);
			}
		});
		listen("sync-theme", (event) => {
			renderer.applyTheme(event.payload);
			if (globalThis._lastBalloons) {
				renderer.renderBalloonSubmenu(globalThis._lastBalloons, event.payload);
			}
		});
		listen("sync-balloons", (event) => {
			globalThis._lastBalloons = event.payload;
			renderer.renderBalloonSubmenu(
				event.payload,
				document.documentElement.getAttribute("data-balloon-theme"),
			);
		});
	}

	globalThis.addEventListener("message", (event) => {
		if (event.data?.type === "sync-scope") {
			const scope =
				typeof event.data.scope === "number"
					? event.data.scope
					: parseInt(event.data.scope, 10);
			if (!Number.isNaN(scope)) {
				dispatcher.setScope(scope);
				renderer.renderDressupSubmenu(null, scope);
			}
		} else if (event.data?.type === "sync-ghosts") {
			renderer.renderGhostSubmenu(
				event.data.ghosts || [],
				event.data.currentGhost,
			);
			if (event.data.dressup) {
				renderer.renderDressupSubmenu(
					event.data.dressup,
					event.data.scope ?? dispatcher.currentScope,
				);
			}
			renderer.renderRecentSubmenu(event.data.recentGhosts || []);
		} else if (event.data?.type === "sync-shells") {
			renderer.renderShellSubmenu(
				event.data.shells || ["master"],
				event.data.currentShell || "master",
			);
			const activeShell =
				event.data.shells?.find(
					(s: { name: unknown }) => s.name === event.data.currentShell,
				) || event.data.shells?.[0];
			if (activeShell) {
				renderer.applyShellTheme(activeShell);
			}
			if (event.data.captions) {
				renderer.applyCaptions(event.data.captions);
			}
		} else if (event.data?.type === "sync-menu-captions") {
			if (event.data.captions) {
				renderer.applyCaptions(event.data.captions);
			}
		} else if (event.data?.type === "sync-theme") {
			renderer.applyTheme(event.data.theme);
			if (globalThis._lastBalloons) {
				renderer.renderBalloonSubmenu(globalThis._lastBalloons, event.data.theme);
			}
		} else if (event.data?.type === "sync-balloons") {
			globalThis._lastBalloons = event.data.balloons;
			renderer.renderBalloonSubmenu(
				event.data.balloons,
				document.documentElement.getAttribute("data-balloon-theme"),
			);
		}
	});
}

