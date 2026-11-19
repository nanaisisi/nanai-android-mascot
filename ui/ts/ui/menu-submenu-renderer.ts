/**
 * @file menu-submenu-renderer.js
 * @brief コンテキストメニューの各サブメニュー描画を統合するメインクラス
 */

import type { MenuDispatcher } from "./menu-dispatcher.js";
import {
	type BalloonMenuItem,
	type DressupMenuPayload,
	menuBalloonDressupRenderer,
	type RecentGhostInput,
} from "./renderers/menu-balloon-dressup-renderer.js";
import { menuCaptionRenderer } from "./renderers/menu-caption-renderer.js";
import {
	type MenuGhostInput,
	type MenuGhostItem,
	type MenuShellInput,
	menuGhostShellRenderer,
} from "./renderers/menu-ghost-shell-renderer.js";
import {
	type MenuShellItem,
	menuThemeRenderer,
} from "./renderers/menu-theme-renderer.js";

export class MenuSubmenuRenderer {
	dispatcher: Pick<MenuDispatcher, "dispatchAction">;
	dressupData: DressupMenuPayload | null;
	/**
	 * @param {Pick<MenuDispatcher, "dispatchAction">} dispatcher
	 */
	constructor(dispatcher: Pick<MenuDispatcher, "dispatchAction">) {
		this.dispatcher = dispatcher;
		this.dressupData = null;
	}

	renderShellSubmenu(shells: MenuShellInput[], currentShell?: string | null) {
		menuGhostShellRenderer.renderShellSubmenu.call(this, shells, currentShell);
	}

	renderBalloonSubmenu(
		balloons: BalloonMenuItem[] | null | undefined,
		currentBalloonTheme?: string | null,
	) {
		menuBalloonDressupRenderer.renderBalloonSubmenu.call(
			this,
			balloons,
			currentBalloonTheme,
		);
	}

	renderGhostSubmenu(
		ghosts: MenuGhostInput[],
		currentGhost?: MenuGhostItem | string | null,
	) {
		menuGhostShellRenderer.renderGhostSubmenu.call(this, ghosts, currentGhost);
	}

	renderCallGhostSubmenu(ghosts: MenuGhostInput[]) {
		menuGhostShellRenderer.renderCallGhostSubmenu.call(this, ghosts);
	}

	renderDressupSubmenu(dressup?: DressupMenuPayload | null, scope = 0) {
		menuBalloonDressupRenderer.renderDressupSubmenu.call(this, dressup, scope);
	}

	renderRecentSubmenu(recentGhosts: RecentGhostInput[] = []) {
		menuBalloonDressupRenderer.renderRecentSubmenu.call(this, recentGhosts);
	}

	applyTheme(theme: string) {
		menuThemeRenderer.applyTheme(theme);
	}

	applyShellTheme(activeShell: MenuShellItem | string | null | undefined) {
		menuThemeRenderer.applyShellTheme(activeShell);
	}

	applyCaptions(
		captions: Record<string, string> | undefined,
		rootEl: ParentNode = document,
	) {
		menuCaptionRenderer.applyCaptions(captions, rootEl);
	}
}
