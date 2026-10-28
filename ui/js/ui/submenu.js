/**
 * @file submenu.js
 * @brief 独立サブメニューウィンドウ制御のメインエントリポイント
 */
import {
	emit,
	invoke,
	isTauriAvailable,
	listen,
	startDraggingWindow,
} from "../core/tauri-helper.js";
import { renderSubmenuContent } from "./submenu-renderer.js";
import { applyShellMenuTheme } from "./submenu-theme.js";

/** @type {string} */
let currentSubmenuType = "ghost";
/** @type {string[]} */
let cachedGhosts = [];
/** @type {string|null} */
let currentGhostName = null;
/** @type {string[]} */
let cachedShells = [];
/** @type {string|null} */
let currentShellName = null;
/** @type {{ sakura: object, kero: object }|null} */
let cachedDressup = null;
/** @type {number} */
let dressupScope = 0;
/** @type {any[]} */
let cachedBalloons = [];
/** @type {string|null} */
let currentBalloonTheme = null;
/** @type {string[]} */
let cachedRecentGhosts = [];

document.addEventListener("mousedown", (event) => {
	if (event.button !== 0 || !isTauriAvailable()) return;
	if (event.target.closest(".menu-item")) return;
	startDraggingWindow();
});

/**
 * サブメニューのアクションをイベントとして送信
 * @param {string} action
 * @param {any} [payload]
 */
async function dispatchSubmenuAction(action, payload = null) {
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
				data.shells?.find((s) => s.name === data.currentShell) ||
				data.shells?.[0];
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
		document.body.classList.remove(
			"balloon-theme-ivory",
			"balloon-theme-pixel",
			"balloon-theme-comic",
			"balloon-theme-dark",
		);
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
		invoke("notify_submenu_ready").catch(() => {});
	}
});
