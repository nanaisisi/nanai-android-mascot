/**
 * @file menu-renderer.js
 * @brief 右クリックSSP標準メニューおよび動的サブメニューの統合描画・管理を行うレンダラークラス
 */

import { menuBalloonDressupRenderer } from "./menu-balloon-dressup-renderer.js";
import { menuGhostShellRenderer } from "./menu-ghost-shell-renderer.js";
import { menuThemeRenderer } from "./menu-theme-renderer.js";

export class MenuRenderer {
	/**
	 * @param {object} options
	 * @param {import('../menu-dispatcher.js').MenuDispatcher} options.dispatcher メニューディスパッチャー
	 * @param {object} [options.app] アプリケーション参照
	 */
	constructor({ dispatcher, app = null }) {
		this.dispatcher = dispatcher;
		this.app = app;
		/** @type {any} */
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
	renderShellSubmenu(shells, currentShell) {
		menuGhostShellRenderer.renderShellSubmenu.call(this, shells, currentShell);
	}

	/**
	 * バルーンテーマ選択サブメニューの描画
	 * @param {Array<object>} balloons
	 * @param {string} currentBalloonTheme
	 */
	renderBalloonSubmenu(balloons, currentBalloonTheme) {
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
	renderGhostSubmenu(ghosts, currentGhost) {
		menuGhostShellRenderer.renderGhostSubmenu.call(this, ghosts, currentGhost);
	}

	/**
	 * 他のゴーストを呼ぶサブメニューの描画
	 * @param {Array<string|object>} ghosts
	 */
	renderCallGhostSubmenu(ghosts) {
		menuGhostShellRenderer.renderCallGhostSubmenu.call(this, ghosts);
	}

	/**
	 * 着せ替えサブメニューの描画
	 * @param {object} dressup
	 * @param {number} [scope=0]
	 */
	renderDressupSubmenu(dressup, scope = 0) {
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
	applyTheme(theme) {
		menuThemeRenderer.applyTheme(theme);
	}

	/**
	 * シェル定義によるメニュースキン・背景テーマの適用
	 * @param {object|null} activeShell
	 */
	applyShellTheme(activeShell) {
		menuThemeRenderer.applyShellTheme(activeShell);
	}

	/**
	 * メニュー項目要素を動的に生成
	 * @param {object} item
	 * @param {string} item.label ラベル
	 * @param {string} [item.action] ディスパッチするアクション名
	 * @param {boolean} [item.isCurrent=false] 現在選択中フラグ
	 * @param {boolean} [item.disabled=false] 無効化フラグ
	 * @param {string} [item.shortcut] ショートカットキー表示
	 * @returns {HTMLButtonElement|HTMLDivElement}
	 */
	createMenuItem({
		label,
		action,
		isCurrent = false,
		disabled = false,
		shortcut = "",
	}) {
		if (disabled) {
			const div = document.createElement("div");
			div.className = "menu-item is-disabled";
			div.innerHTML = `<span>${label}</span>`;
			return div;
		}

		const btn = document.createElement("button");
		btn.type = "button";
		btn.className = `menu-item${isCurrent ? " is-current" : ""}`;
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
