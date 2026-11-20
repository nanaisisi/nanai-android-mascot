/**
 * @file menu-renderer.js
 * @brief 右クリックSSP標準メニューおよび動的サブメニューの統合描画・管理を行うレンダラークラス
 */

import type { MenuDispatcher } from "../menu-dispatcher.js";
import {
	type BalloonMenuItem,
	type DressupMenuPayload,
	menuBalloonDressupRenderer,
	type RecentGhostInput,
} from "./menu-balloon-dressup-renderer.js";
import { menuCaptionRenderer } from "./menu-caption-renderer.js";
import {
	type MenuGhostInput,
	type MenuGhostItem,
	type MenuShellInput,
	menuGhostShellRenderer,
} from "./menu-ghost-shell-renderer.js";
import {
	type MenuShellItem,
	menuThemeRenderer,
} from "./menu-theme-renderer.js";

export interface MenuItemOptions {
	label: string;
	action?: string;
	isCurrent?: boolean;
	disabled?: boolean;
	shortcut?: string;
	hasSubmenu?: boolean;
}

export class MenuRenderer {
	dispatcher: Pick<MenuDispatcher, "dispatchAction">;
	app: unknown;
	dressupData: DressupMenuPayload | null;
	/**
	 * @param {object} options
	 * @param {Pick<MenuDispatcher, "dispatchAction">} options.dispatcher メニューディスパッチャー
	 * @param {unknown} [options.app] アプリケーション参照
	 */
	constructor({
		dispatcher,
		app = null,
	}: {
		dispatcher: Pick<MenuDispatcher, "dispatchAction">;
		app?: unknown;
	}) {
		this.dispatcher = dispatcher;
		this.app = app;
		this.dressupData = null;
	}

	/**
	 * メニュー全体の基本設定や初期化
	 * @param {HTMLElement|Document} rootEl
	 */
	init(rootEl: ParentNode = document) {
		const menuItems = rootEl.querySelectorAll?.(".menu-item[data-action]");
		if (!menuItems) return;

		menuItems.forEach((item) => {
			item.addEventListener("click", (e) => {
				const action = item.getAttribute("data-action");
				if (action) {
					e.stopPropagation();
					this.dispatcher?.dispatchAction(action);
				}
			});
		});
	}

	/**
	 * シェル選択サブメニューの描画
	 * @param {MenuShellInput[]} shells
	 * @param {string | null | undefined} currentShell
	 */
	renderShellSubmenu(
		shells: MenuShellInput[],
		currentShell?: string | null,
		ghostName?: string | null,
	) {
		menuGhostShellRenderer.renderShellSubmenu.call(
			this,
			shells,
			currentShell,
			ghostName,
		);
	}

	/**
	 * バルーンテーマ選択サブメニューの描画
	 * @param {BalloonMenuItem[] | null | undefined} balloons
	 * @param {string | null | undefined} currentBalloonTheme
	 */
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

	/**
	 * ゴースト切り替えサブメニューの描画
	 * @param {MenuGhostInput[]} ghosts
	 * @param {MenuGhostItem | string | null | undefined} currentGhost
	 */
	renderGhostSubmenu(
		ghosts: MenuGhostInput[],
		currentGhost?: MenuGhostItem | string | null,
	) {
		menuGhostShellRenderer.renderGhostSubmenu.call(this, ghosts, currentGhost);
	}

	/**
	 * 他のゴーストを呼ぶサブメニューの描画
	 * @param {MenuGhostInput[]} ghosts
	 */
	renderCallGhostSubmenu(ghosts: MenuGhostInput[]) {
		menuGhostShellRenderer.renderCallGhostSubmenu.call(this, ghosts);
	}

	/**
	 * 着せ替えサブメニューの描画
	 * @param {DressupMenuPayload | null | undefined} dressup
	 * @param {number} [scope=0]
	 */
	renderDressupSubmenu(dressup?: DressupMenuPayload | null, scope = 0) {
		menuBalloonDressupRenderer.renderDressupSubmenu.call(this, dressup, scope);
	}

	/**
	 * 最近使ったゴースト履歴サブメニューの描画
	 * @param {RecentGhostInput[]} [recentGhosts=[]]
	 */
	renderRecentSubmenu(recentGhosts: RecentGhostInput[] = []) {
		menuBalloonDressupRenderer.renderRecentSubmenu.call(this, recentGhosts);
	}

	/**
	 * メニューテーマ（ダーク/ライト等）の適用
	 * @param {string} theme
	 */
	applyTheme(theme: string) {
		menuThemeRenderer.applyTheme(theme);
	}

	/**
	 * シェル定義によるメニュースキン・背景テーマの適用
	 * @param {MenuShellItem | string | null | undefined} activeShell
	 */
	applyShellTheme(activeShell: MenuShellItem | string | null | undefined) {
		menuThemeRenderer.applyShellTheme(activeShell);
	}

	/**
	 * メニュー項目キャプションを動的に更新 (UKADOC ownerdraw-item-name 準拠)
	 * @param {Record<string, string>} captions
	 * @param {HTMLElement|Document} [rootEl=document]
	 */
	applyCaptions(
		captions: Record<string, string> | undefined,
		rootEl: ParentNode = document,
	) {
		menuCaptionRenderer.applyCaptions(captions, rootEl);
	}

	/**
	 * SHIORIからメニューキャプションリソースを取得
	 * @param {unknown} ghostController
	 * @returns {Promise<Record<string, string>>}
	 */
	async fetchCaptions(ghostController: unknown) {
		return await menuCaptionRenderer.fetchShioriCaptions(ghostController);
	}

	/**
	 * メニュー項目要素を動的に生成
	 * @param {MenuItemOptions} item
	 * @returns {HTMLButtonElement|HTMLDivElement}
	 */
	createMenuItem({
		label,
		action,
		isCurrent = false,
		disabled = false,
		shortcut = "",
		hasSubmenu = false,
	}: MenuItemOptions): HTMLButtonElement | HTMLDivElement {
		if (disabled) {
			const div = document.createElement("div");
			div.className = "menu-item is-disabled";
			div.innerHTML = `<span>${label}</span>`;
			return div;
		}

		const btn = document.createElement("button");
		btn.type = "button";
		btn.className = `menu-item${isCurrent ? " is-current" : ""}${hasSubmenu ? " has-submenu" : ""}`;
		if (hasSubmenu) {
			btn.setAttribute("aria-haspopup", "true");
		}
		if (action) {
			btn.setAttribute("data-action", action);
		}

		let html = `<span>${isCurrent ? "✓ " : ""}${label}</span>`;
		if (shortcut) {
			html += `<span class="shortcut-key">${shortcut}</span>`;
		}
		btn.innerHTML = html;

		btn.addEventListener("click", (e) => {
			e.stopPropagation();
			if (action) {
				this.dispatcher?.dispatchAction(action);
			}
		});

		return btn;
	}
}
