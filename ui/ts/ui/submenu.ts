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
import { renderSubmenuContent } from "./submenu-renderer.js";
import { applyShellMenuTheme } from "./submenu-theme.js";

/**
 * [Design Invariant / 設計仕様]
 * サブメニューウィンドウは固定ポップアップとして表示されるため、
 * キャラクターやバルーンウィンドウとは異なり、ドラッグ移動不可（非ドラッグ）仕様です。
 * 誤ってウィンドウドラッグ機能（startDraggingWindow）を追加しないよう注意してください。
 */

/** @type {string} */
let currentSubmenuType = "ghost";
/** @type {string[]} */
let cachedGhosts: unknown[] = [];
/** @type {string|null} */
let currentGhostName: null = null;
/** @type {string[]} */
let cachedShells: unknown[] = [];
/** @type {string|null} */
let currentShellName: null = null;
/** @type {{ sakura: object, kero: object }|null} */
let cachedDressup: null = null;
/** @type {number} */
let dressupScope = 0;
/** @type {any[]} */
let cachedBalloons: never[] = [];
/** @type {string|null} */
let currentBalloonTheme: null = null;
/** @type {string[]} */
let cachedRecentGhosts: never[] = [];

/**
 * サブメニューのアクションをイベントとして送信
 * @param {string} action
 * @param {any} [payload]
 */
async function dispatchSubmenuAction(action: unknown, payload = null) {
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
	listen("set-submenu-type", (event) => {
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
							cachedGhosts = (res as { ghosts: unknown[] }).ghosts;
							renderContent();
						}
					})
					.catch(() => {});
			}
		}
	});

	listen("sync-ghosts", (event) => {
		const data = event.payload;
		if (data) {
			cachedGhosts = data.ghosts || [];
			currentGhostName = data.currentGhost;
			cachedShells = data.shells || [];
			currentShellName = data.currentShell;
			cachedRecentGhosts = data.recentGhosts || [];
			if (data.dressup) {
				cachedDressup = data.dressup;
			}
			if (typeof data.scope === "number") {
				dressupScope = data.scope;
			}
			const activeShell =
				data.shells?.find((s: unknown) => s.name === data.currentShell) ||
				data.shells?.[0];
			applyShellMenuTheme(activeShell);
			renderContent();
		}
	});

	listen("sync-shells", (event) => {
		const data = event.payload;
		if (data) {
			cachedShells = data.shells || cachedShells;
			currentShellName = data.currentShell || currentShellName;
			const activeShell =
				cachedShells?.find((s: unknown) => s.name === currentShellName) ||
				cachedShells?.[0];
			applyShellMenuTheme(activeShell);
			renderContent();
		}
	});

	listen("sync-balloons", (event) => {
		cachedBalloons = event.payload || [];
		renderContent();
	});

	listen("sync-theme", (event) => {
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

	listen("sync-menu-scope", (event) => {
		const scope =
			typeof event.payload === "number"
				? event.payload
				: parseInt(event.payload, 10);
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
