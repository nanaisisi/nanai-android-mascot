import { isTauriAvailable, listen } from "../core/tauri-helper.js";
import type { MenuDispatcher } from "./menu-dispatcher.js";
import type { MenuSubmenuRenderer } from "./menu-submenu-renderer.js";
import type {
	BalloonMenuItem,
	DressupMenuPayload,
	RecentGhostInput,
} from "./renderers/menu-balloon-dressup-renderer.js";
import type {
	MenuGhostInput,
	MenuGhostItem,
	MenuShellInput,
} from "./renderers/menu-ghost-shell-renderer.js";
import type { PluginMenuItem } from "./submenu-renderer.js";

export interface SubmenuSyncStatePatch {
	ghosts?: MenuGhostInput[];
	currentGhostName?: string | null;
	shells?: MenuShellInput[];
	currentShellName?: string | null;
	dressup?: DressupMenuPayload | null;
	dressupScope?: number;
	balloons?: BalloonMenuItem[];
	currentBalloonTheme?: string | null;
	recentGhosts?: RecentGhostInput[];
	plugins?: PluginMenuItem[];
}

interface TauriSyncEvent<T> {
	payload: T;
}

interface SyncGhostsPayload {
	ghosts?: MenuGhostInput[];
	currentGhost?: MenuGhostItem | string | null;
	shells?: MenuShellInput[];
	currentShell?: string | null;
	scope?: number;
	dressup?: DressupMenuPayload | null;
	recentGhosts?: RecentGhostInput[];
	plugins?: PluginMenuItem[];
	captions?: Record<string, string>;
}

const syncGlobal = globalThis as typeof globalThis & {
	_lastBalloons?: BalloonMenuItem[] | null;
};

export function setupContextMenuSync(
	dispatcher: MenuDispatcher,
	renderer: MenuSubmenuRenderer,
	onScopeSync?: () => void,
	onContentUpdate?: () => void,
	onDataSync?: (patch: SubmenuSyncStatePatch) => void,
) {
	if (isTauriAvailable()) {
		listen("sync-menu-scope", (rawEvent) => {
			const event = rawEvent as TauriSyncEvent<number | string>;
			const scope =
				typeof event.payload === "number"
					? event.payload
					: parseInt(String(event.payload), 10);
			if (!Number.isNaN(scope)) {
				onScopeSync?.();
				dispatcher.setScope(scope);
				renderer.renderDressupSubmenu(null, scope);
				onDataSync?.({ dressupScope: scope });
				dispatcher.dispatchAction("request-sync");
			}
		});
		listen("sync-ghosts", (rawEvent) => {
			const event = rawEvent as TauriSyncEvent<SyncGhostsPayload | null>;
			const data = event.payload;
			if (data) {
				if (
					typeof data.scope === "number" &&
					data.scope !== dispatcher.currentScope
				) {
					dispatcher.setScope(data.scope);
				}
				const ghostName =
					typeof data.currentGhost === "string"
						? data.currentGhost
						: data.currentGhost?.name;
				renderer.renderGhostSubmenu(data.ghosts || [], data.currentGhost);
				renderer.renderCallGhostSubmenu(data.ghosts || []);
				if (data.shells) {
					renderer.renderShellSubmenu(
						data.shells,
						data.currentShell,
						ghostName,
					);
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
						(s) =>
							typeof s === "object" &&
							s !== null &&
							s.name === data.currentShell,
					) || data.shells?.[0];
				renderer.applyShellTheme(activeShell);
				if (data.captions) {
					renderer.applyCaptions(data.captions);
				}
				onDataSync?.({
					ghosts: data.ghosts || [],
					currentGhostName: ghostName ?? null,
					shells: data.shells,
					currentShellName: data.currentShell ?? null,
					dressup: data.dressup,
					dressupScope: data.scope ?? dispatcher.currentScope,
					recentGhosts: data.recentGhosts || [],
					plugins: data.plugins,
				});
				onContentUpdate?.();
			}
		});
		listen("sync-menu-captions", (rawEvent) => {
			const event = rawEvent as TauriSyncEvent<
				Record<string, string> | undefined
			>;
			if (event.payload) {
				renderer.applyCaptions(event.payload);
				onContentUpdate?.();
			}
		});
		listen("sync-theme", (rawEvent) => {
			const event = rawEvent as TauriSyncEvent<string | null | undefined>;
			renderer.applyTheme(event.payload ?? "");
			const theme =
				event.payload ||
				document.documentElement.getAttribute("data-balloon-theme") ||
				localStorage.getItem("nanai_balloon_theme") ||
				"nam";
			onDataSync?.({ currentBalloonTheme: theme });
			if (syncGlobal._lastBalloons) {
				renderer.renderBalloonSubmenu(syncGlobal._lastBalloons, theme);
			}
			onContentUpdate?.();
		});
		listen("sync-balloons", (rawEvent) => {
			const event = rawEvent as TauriSyncEvent<BalloonMenuItem[] | null>;
			syncGlobal._lastBalloons = event.payload;
			const theme =
				document.documentElement.getAttribute("data-balloon-theme") ||
				localStorage.getItem("nanai_balloon_theme") ||
				"nam";
			renderer.renderBalloonSubmenu(event.payload, theme);
			onDataSync?.({
				balloons: event.payload || [],
				currentBalloonTheme: theme,
			});
		});
	}

	globalThis.addEventListener("message", (event) => {
		if (event.data?.type === "sync-scope") {
			const scope =
				typeof event.data.scope === "number"
					? event.data.scope
					: parseInt(event.data.scope, 10);
			if (!Number.isNaN(scope)) {
				if (event.data.resetSubmenu !== false) {
					onScopeSync?.();
				}
				dispatcher.setScope(scope);
				renderer.renderDressupSubmenu(null, scope);
				onDataSync?.({ dressupScope: scope });
			}
		} else if (event.data?.type === "sync-ghosts") {
			const ghostName =
				typeof event.data.currentGhost === "string"
					? event.data.currentGhost
					: event.data.currentGhost?.name;
			renderer.renderGhostSubmenu(
				event.data.ghosts || [],
				event.data.currentGhost,
			);
			renderer.renderCallGhostSubmenu(event.data.ghosts || []);
			const syncedShells =
				Array.isArray(event.data.shells) && event.data.shells.length > 0
					? event.data.shells
					: undefined;
			if (syncedShells) {
				renderer.renderShellSubmenu(
					syncedShells,
					event.data.currentShell || "master",
					ghostName,
				);
			}
			if (event.data.dressup) {
				renderer.renderDressupSubmenu(
					event.data.dressup,
					event.data.scope ?? dispatcher.currentScope,
				);
			}
			renderer.renderRecentSubmenu(event.data.recentGhosts || []);
			if (event.data.captions) {
				renderer.applyCaptions(event.data.captions);
			}
			onDataSync?.({
				ghosts: event.data.ghosts || [],
				currentGhostName: ghostName ?? null,
				shells: syncedShells,
				currentShellName:
					event.data.currentShell ?? (syncedShells ? "master" : undefined),
				dressup: event.data.dressup,
				dressupScope: event.data.scope ?? dispatcher.currentScope,
				recentGhosts: event.data.recentGhosts || [],
				plugins: event.data.plugins,
			});
		} else if (event.data?.type === "sync-shells") {
			const ghostName =
				typeof event.data.currentGhost === "string"
					? event.data.currentGhost
					: event.data.currentGhost?.name;
			const shells =
				Array.isArray(event.data.shells) && event.data.shells.length > 0
					? event.data.shells
					: ["master"];
			const currentShell = event.data.currentShell || "master";
			renderer.renderShellSubmenu(shells, currentShell, ghostName);
			const activeShell =
				shells.find(
					(s: MenuShellInput) =>
						typeof s === "object" && s !== null && s.name === currentShell,
				) || shells[0];
			if (activeShell) {
				renderer.applyShellTheme(activeShell);
			}
			if (event.data.captions) {
				renderer.applyCaptions(event.data.captions);
			}
			onDataSync?.({
				shells,
				currentShellName: currentShell,
				currentGhostName: ghostName ?? undefined,
			});
		} else if (event.data?.type === "sync-menu-captions") {
			if (event.data.captions) {
				renderer.applyCaptions(event.data.captions);
			}
		} else if (event.data?.type === "sync-theme") {
			renderer.applyTheme(event.data.theme);
			const theme =
				event.data.theme ||
				document.documentElement.getAttribute("data-balloon-theme") ||
				localStorage.getItem("nanai_balloon_theme") ||
				"nam";
			onDataSync?.({ currentBalloonTheme: theme });
			if (syncGlobal._lastBalloons) {
				renderer.renderBalloonSubmenu(syncGlobal._lastBalloons, theme);
			}
		} else if (event.data?.type === "sync-balloons") {
			syncGlobal._lastBalloons = event.data.balloons;
			const theme =
				document.documentElement.getAttribute("data-balloon-theme") ||
				localStorage.getItem("nanai_balloon_theme") ||
				"nam";
			renderer.renderBalloonSubmenu(event.data.balloons, theme);
			onDataSync?.({
				balloons: event.data.balloons || [],
				currentBalloonTheme: theme,
			});
		}
	});
}
