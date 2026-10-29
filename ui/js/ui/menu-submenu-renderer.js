/**
 * @file menu-submenu-renderer.js
 * @brief コンテキストメニューの各サブメニュー描画を統合するメインクラス
 */

import { menuBalloonDressupRenderer } from "./renderers/menu-balloon-dressup-renderer.js";
import { menuGhostShellRenderer } from "./renderers/menu-ghost-shell-renderer.js";
import { menuThemeRenderer } from "./renderers/menu-theme-renderer.js";

export class MenuSubmenuRenderer {
	/**
	 * @param {import('./menu-dispatcher.js').MenuDispatcher} dispatcher
	 */
	constructor(dispatcher) {
		this.dispatcher = dispatcher;
		/** @type {any} */
		this.dressupData = null;
	}

	renderShellSubmenu(shells, currentShell) {
		menuGhostShellRenderer.renderShellSubmenu.call(this, shells, currentShell);
	}

	renderBalloonSubmenu(balloons, currentBalloonTheme) {
		menuBalloonDressupRenderer.renderBalloonSubmenu.call(
			this,
			balloons,
			currentBalloonTheme,
		);
	}

	renderGhostSubmenu(ghosts, currentGhost) {
		menuGhostShellRenderer.renderGhostSubmenu.call(this, ghosts, currentGhost);
	}

	renderCallGhostSubmenu(ghosts) {
		menuGhostShellRenderer.renderCallGhostSubmenu.call(this, ghosts);
	}

	renderDressupSubmenu(dressup, scope = 0) {
		menuBalloonDressupRenderer.renderDressupSubmenu.call(this, dressup, scope);
	}

	renderRecentSubmenu(recentGhosts = []) {
		menuBalloonDressupRenderer.renderRecentSubmenu.call(this, recentGhosts);
	}

	applyTheme(theme) {
		menuThemeRenderer.applyTheme(theme);
	}

	applyShellTheme(activeShell) {
		menuThemeRenderer.applyShellTheme(activeShell);
	}
}
