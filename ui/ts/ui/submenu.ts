/**
 * @file submenu.js
 * @brief 独立サブメニューウィンドウ制御のメインエントリポイント
 */

import { AppConfig } from "../core/config.js";
import {
	emit,
	invoke,
	isTauriAvailable,
	listen,
} from "../core/tauri-helper.js";
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
import { renderSubmenuContent } from "./submenu-renderer.js";
import { applyShellMenuTheme } from "./submenu-theme.js";

interface TauriSubmenuEvent<T> {
	payload: T;
}

interface SubmenuSyncGhostsPayload {
	ghosts?: MenuGhostInput[];
	currentGhost?: MenuGhostItem | string | null;
	shells?: MenuShellInput[];
	currentShell?: string | null;
	recentGhosts?: RecentGhostInput[];
	dressup?: DressupMenuPayload | null;
	scope?: number;
}

interface SubmenuSyncShellsPayload {
	shells?: MenuShellInput[];
	currentShell?: string | null;
}

/**
 * [Design Invariant / 設計仕様]
 * サブメニューウィンドウは固定ポップアップとして表示されるため、
 * キャラクターやバルーンウィンドウとは異なり、ドラッグ移動不可（非ドラッグ）仕様です。
 * 誤ってウィンドウドラッグ機能（startDraggingWindow）を追加しないよう注意してください。
 */

let currentSubmenuType = "ghost";
let cachedGhosts: MenuGhostInput[] = [];
let currentGhostName: string | null = null;
let cachedShells: MenuShellInput[] = [];
let currentShellName: string | null = null;
let cachedDressup: DressupMenuPayload | null = null;
let dressupScope = 0;
let cachedBalloons: BalloonMenuItem[] = [];
let currentBalloonTheme: string | null = null;
let cachedRecentGhosts: RecentGhostInput[] = [];

/**
 * サブメニューのアクションをイベントとして送信
 * @param {string} action
 * @param {unknown} [payload]
 */
async function dispatchSubmenuAction(action: string, payload: unknown = null) {
	if (globalThis.parent && (globalThis.parent as unknown) !== globalThis) {
		globalThis.parent.postMessage(
			{
				type: "menu-action",
				action: action,
				payload: payload,
				timestamp: Date.now(),
			},
			"*",
		);
	}
	if (isTauriAvailable()) {
		try {
			await emit("menu-action", { action, payload });
			await Promise.all([
				invoke("hide_menu_window"),
				invoke("hide_submenu_window"),
			]);
		} catch (error) {
			console.error("サブメニューアクションの送信に失敗しました:", error);
		}
	}
}

function renderContent() {
	if (!currentBalloonTheme) {
		try {
			currentBalloonTheme =
				localStorage.getItem("nanai_balloon_theme") ||
				document.documentElement.getAttribute("data-balloon-theme") ||
				"nam";
		} catch (_e) {
			currentBalloonTheme = "nam";
		}
	}
	renderSubmenuContent({
		currentSubmenuType,
		cachedGhosts,
		currentGhostName,
		cachedShells,
		currentShellName,
		cachedDressup,
		dressupScope,
		cachedBalloons,
		currentBalloonTheme,
		cachedRecentGhosts,
		dispatchSubmenuAction,
	});
}

if (isTauriAvailable()) {
	listen("set-submenu-type", (rawEvent) => {
		const event = rawEvent as TauriSubmenuEvent<{ type?: string } | null>;
		if (event.payload?.type) {
			currentSubmenuType = event.payload.type;
			renderContent();
			if (
				(currentSubmenuType === "ghost" ||
					currentSubmenuType === "call-ghost") &&
				cachedGhosts.length === 0
			) {
				void emit("menu-action", { action: "request-sync" });
				invoke("scan_ghosts", {
					ghostPath: AppConfig.paths.defaultGhostDir || "assets/ghost",
				})
					.then((res: unknown) => {
						if (
							res &&
							typeof res === "object" &&
							Array.isArray((res as { ghosts?: unknown[] }).ghosts) &&
							(res as { ghosts: unknown[] }).ghosts.length > 0 &&
							cachedGhosts.length === 0
						) {
							cachedGhosts = (res as { ghosts: MenuGhostInput[] }).ghosts;
							renderContent();
						}
					})
					.catch(() => {});
			}
		}
	});

	listen("sync-ghosts", (rawEvent) => {
		const event =
			rawEvent as TauriSubmenuEvent<SubmenuSyncGhostsPayload | null>;
		const data = event.payload;
		if (data) {
			cachedGhosts = data.ghosts || [];
			currentGhostName =
				typeof data.currentGhost === "string"
					? data.currentGhost
					: (data.currentGhost?.name ?? null);
			cachedShells = data.shells || [];
			currentShellName = data.currentShell ?? null;
			cachedRecentGhosts = data.recentGhosts || [];
			if (data.dressup) {
				cachedDressup = data.dressup;
			}
			if (typeof data.scope === "number") {
				dressupScope = data.scope;
			}
			const activeShell =
				data.shells?.find(
					(s) =>
						typeof s === "object" && s !== null && s.name === data.currentShell,
				) || data.shells?.[0];
			applyShellMenuTheme(activeShell);
			renderContent();
		}
	});

	listen("sync-shells", (rawEvent) => {
		const event =
			rawEvent as TauriSubmenuEvent<SubmenuSyncShellsPayload | null>;
		const data = event.payload;
		if (data) {
			cachedShells = data.shells || cachedShells;
			currentShellName = data.currentShell || currentShellName;
			const activeShell =
				cachedShells?.find(
					(s) =>
						typeof s === "object" && s !== null && s.name === currentShellName,
				) || cachedShells?.[0];
			applyShellMenuTheme(activeShell);
			renderContent();
		}
	});

	listen("sync-balloons", (rawEvent) => {
		const event = rawEvent as TauriSubmenuEvent<BalloonMenuItem[] | null>;
		cachedBalloons = event.payload || [];
		renderContent();
	});

	listen("sync-theme", (rawEvent) => {
		const event = rawEvent as TauriSubmenuEvent<string | null | undefined>;
		currentBalloonTheme = event.payload || null;
		document.documentElement.setAttribute(
			"data-balloon-theme",
			currentBalloonTheme || "",
		);
		for (const cls of Array.from(document.body.classList)) {
			if (cls.startsWith("balloon-theme-")) {
				document.body.classList.remove(cls);
			}
		}
		if (currentBalloonTheme) {
			document.body.classList.add(`balloon-theme-${currentBalloonTheme}`);
		}
		renderContent();
	});

	listen("sync-menu-scope", (rawEvent) => {
		const event = rawEvent as TauriSubmenuEvent<number | string>;
		const scope =
			typeof event.payload === "number"
				? event.payload
				: parseInt(String(event.payload), 10);
		if (!Number.isNaN(scope)) {
			dressupScope = scope;
			if (currentSubmenuType === "dressup") {
				renderContent();
			}
		}
	});
}

globalThis.addEventListener("DOMContentLoaded", () => {
	try {
		const savedTheme = localStorage.getItem("nanai_balloon_theme");
		if (savedTheme) {
			document.documentElement.setAttribute("data-balloon-theme", savedTheme);
			document.body.classList.add(`balloon-theme-${savedTheme}`);
		}
	} catch (_err) {
		// LocalStorage access restricted or unavailable
	}
	renderContent();
	if (isTauriAvailable()) {
		void emit("menu-action", { action: "request-sync" });
		invoke("notify_submenu_ready").catch(() => {});
	}
});
