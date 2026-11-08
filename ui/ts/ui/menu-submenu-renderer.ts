/**
 * @file menu-submenu-renderer.js
 * @brief コンテキストメニューの各サブメニュー描画を統合するメインクラス
 */

import type { MenuDispatcher } from "./menu-dispatcher.js";
import { menuBalloonDressupRenderer } from "./renderers/menu-balloon-dressup-renderer.js";
import { menuCaptionRenderer } from "./renderers/menu-caption-renderer.js";
import { menuGhostShellRenderer } from "./renderers/menu-ghost-shell-renderer.js";
import { menuThemeRenderer } from "./renderers/menu-theme-renderer.js";

export class MenuSubmenuRenderer {
	dispatcher: MenuDispatcher;
	dressupData: null;
	/**
	 * @param {import('./menu-dispatcher.js').MenuDispatcher} dispatcher
	 */
	constructor(dispatcher: MenuDispatcher) {
		this.dispatcher = dispatcher;
		/** @type {unknown} */
		this.dressupData = null;
	}

	renderShellSubmenu(shells: unknown, currentShell: unknown) {
		menuGhostShellRenderer.renderShellSubmenu.call(this, shells, currentShell);
	}

	renderBalloonSubmenu(balloons: unknown, currentBalloonTheme: string | null) {
		menuBalloonDressupRenderer.renderBalloonSubmenu.call(
			this,
			balloons,
			currentBalloonTheme,
		);
	}

	renderGhostSubmenu(ghosts: unknown, currentGhost: unknown) {
		menuGhostShellRenderer.renderGhostSubmenu.call(this, ghosts, currentGhost);
	}

	renderCallGhostSubmenu(ghosts: unknown) {
		menuGhostShellRenderer.renderCallGhostSubmenu.call(this, ghosts);
	}

	renderDressupSubmenu(dressup: null, scope = 0) {
		menuBalloonDressupRenderer.renderDressupSubmenu.call(this, dressup, scope);
	}

	renderRecentSubmenu(recentGhosts = []) {
		menuBalloonDressupRenderer.renderRecentSubmenu.call(this, recentGhosts);
	}

	applyTheme(theme: string) {
		menuThemeRenderer.applyTheme(theme);
	}

	applyShellTheme(activeShell: unknown) {
		menuThemeRenderer.applyShellTheme(activeShell);
	}

	applyCaptions(
		captions: Record<string, string> | undefined,
		rootEl = document,
	) {
		menuCaptionRenderer.applyCaptions(captions, rootEl);
	}
}
