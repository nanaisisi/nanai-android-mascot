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
		});
	}

	globalThis.addEventListener("message", (event) => {
		if (event.data?.type === "sync-scope") {
			const scope =
				typeof event.data.scope === "number"
					? event.data.scope
					: parseInt(event.data.scope, 10);
			if (!Number.isNaN(scope)) {
				onScopeSync?.();
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
			const ghostName =
				typeof event.data.currentGhost === "string"
					? event.data.currentGhost
					: event.data.currentGhost?.name;
			renderer.renderShellSubmenu(
				event.data.shells || ["master"],
				event.data.currentShell || "master",
				ghostName,
			);
			const activeShell =
				event.data.shells?.find(
					(s: MenuShellInput) =>
						typeof s === "object" &&
						s !== null &&
						s.name === event.data.currentShell,
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
			const theme =
				event.data.theme ||
				document.documentElement.getAttribute("data-balloon-theme") ||
				localStorage.getItem("nanai_balloon_theme") ||
				"nam";
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
		}
	});
}
