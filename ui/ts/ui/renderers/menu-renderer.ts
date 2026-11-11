/**
 * @file menu-renderer.js
 * @brief 右クリックSSP標準メニューおよび動的サブメニューの統合描画・管理を行うレンダラークラス
 */

import { menuBalloonDressupRenderer } from "./menu-balloon-dressup-renderer.js";
import { menuCaptionRenderer } from "./menu-caption-renderer.js";
import { menuGhostShellRenderer } from "./menu-ghost-shell-renderer.js";
import { menuThemeRenderer } from "./menu-theme-renderer.js";

export class MenuRenderer {
	dispatcher: unknown;
	app: null;
	dressupData: null;
	/**
	 * @param {object} options
	 * @param {import('../menu-dispatcher.js').MenuDispatcher} options.dispatcher メニューディスパッチャー
	 * @param {object} [options.app] アプリケーション参照
	 */
	constructor({ dispatcher, app = null }) {
		this.dispatcher = dispatcher;
		this.app = app;
		/** @type {unknown} */
		this.dressupData = null;
	}

	/**
	 * メニュー全体の基本設定や初期化
	 * @param {HTMLElement|Document} rootEl
	 */
	init(rootEl = document) {
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
	 * @param {Array<string|object>} shells
	 * @param {string} currentShell
	 */
	renderShellSubmenu(shells: unknown, currentShell: unknown) {
		menuGhostShellRenderer.renderShellSubmenu.call(this, shells, currentShell);
	}

	/**
	 * バルーンテーマ選択サブメニューの描画
	 * @param {Array<object>} balloons
	 * @param {string} currentBalloonTheme
	 */
	renderBalloonSubmenu(balloons: unknown, currentBalloonTheme: unknown) {
		menuBalloonDressupRenderer.renderBalloonSubmenu.call(
			this,
			balloons,
			currentBalloonTheme,
		);
	}

	/**
	 * ゴースト切り替えサブメニューの描画
	 * @param {Array<string|object>} ghosts
	 * @param {string|object} currentGhost
	 */
	renderGhostSubmenu(ghosts: unknown, currentGhost: unknown) {
		menuGhostShellRenderer.renderGhostSubmenu.call(this, ghosts, currentGhost);
	}

	/**
	 * 他のゴーストを呼ぶサブメニューの描画
	 * @param {Array<string|object>} ghosts
	 */
	renderCallGhostSubmenu(ghosts: unknown) {
		menuGhostShellRenderer.renderCallGhostSubmenu.call(this, ghosts);
	}

	/**
	 * 着せ替えサブメニューの描画
	 * @param {object} dressup
	 * @param {number} [scope=0]
	 */
	renderDressupSubmenu(dressup: unknown, scope = 0) {
		menuBalloonDressupRenderer.renderDressupSubmenu.call(this, dressup, scope);
	}

	/**
	 * 最近使ったゴースト履歴サブメニューの描画
	 * @param {string[]} [recentGhosts=[]]
	 */
	renderRecentSubmenu(recentGhosts = []) {
		menuBalloonDressupRenderer.renderRecentSubmenu.call(this, recentGhosts);
	}

	/**
	 * メニューテーマ（ダーク/ライト等）の適用
	 * @param {string|null} theme
	 */
	applyTheme(theme: string) {
		menuThemeRenderer.applyTheme(theme);
	}

	/**
	 * シェル定義によるメニュースキン・背景テーマの適用
	 * @param {object|null} activeShell
	 */
	applyShellTheme(activeShell: unknown) {
		menuThemeRenderer.applyShellTheme(activeShell);
	}

	/**
	 * メニュー項目キャプションを動的に更新 (UKADOC ownerdraw-item-name 準拠)
	 * @param {Record<string, string>} captions
	 * @param {HTMLElement|Document} [rootEl=document]
	 */
	applyCaptions(
		captions: Record<string, string> | undefined,
		rootEl = document,
	) {
		menuCaptionRenderer.applyCaptions(captions, rootEl);
	}

	/**
	 * SHIORIからメニューキャプションリソースを取得
	 * @param {object} ghostController
	 * @returns {Promise<Record<string, string>>}
	 */
	async fetchCaptions(ghostController: unknown) {
		return await menuCaptionRenderer.fetchShioriCaptions(ghostController);
	}

	/**
	 * メニュー項目要素を動的に生成
	 * @param {object} item
	 * @param {string} item.label ラベル
	 * @param {string} [item.action] ディスパッチするアクション名
	 * @param {boolean} [item.isCurrent=false] 現在選択中フラグ
	 * @param {boolean} [item.disabled=false] 無効化フラグ
	 * @param {string} [item.shortcut] ショートカットキー表示
	 * @param {boolean} [item.hasSubmenu=false] サブメニュー有無フラグ
	 * @returns {HTMLButtonElement|HTMLDivElement}
	 */
	createMenuItem({
		label,
		action,
		isCurrent = false,
		disabled = false,
		shortcut = "",
		hasSubmenu = false,
	}) {
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
