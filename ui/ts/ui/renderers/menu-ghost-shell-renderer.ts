import type { MenuDispatcher } from "../menu-dispatcher.js";
import type { MenuShellItem } from "./menu-theme-renderer.js";

export interface MenuGhostItem {
	name?: string;
	[key: string]: unknown;
}

export type MenuGhostInput = string | MenuGhostItem;
export type MenuShellInput = string | MenuShellItem;

export interface MenuRendererContext {
	dispatcher: Pick<MenuDispatcher, "dispatchAction">;
}

/**
 * @file menu-ghost-shell-renderer.js
 * @brief ゴーストおよびシェル切り替えサブメニューの描画ロジック
 */
export const menuGhostShellRenderer = {
	/**
	 * @param {MenuShellInput[]} shells
	 * @param {string | null | undefined} currentShell
	 */
	renderShellSubmenu(
		this: MenuRendererContext,
		shells: MenuShellInput[],
		currentShell?: string | null,
	) {
		const container = document.getElementById("shell-submenu");
		if (!container) return;

		container.innerHTML = "";

		shells.forEach((shellItem) => {
			const shellName =
				typeof shellItem === "string" ? shellItem : shellItem?.name || "master";
			const displayName =
				typeof shellItem === "object" && shellItem?.display_name
					? shellItem.display_name
					: shellName;
			const isCurrent = currentShell === shellName;
			const btn = document.createElement("button");
			btn.type = "button";
			btn.className = `menu-item${isCurrent ? " is-current" : ""}`;
			btn.dataset.shellName = shellName;
			btn.innerHTML = `<span class="menu-item-indicator">${isCurrent ? "✓" : ""}</span><span class="menu-item-label">${displayName}</span>`;
			btn.addEventListener("click", () => {
				this.dispatcher.dispatchAction("switch-to-shell", shellName);
			});
			container.appendChild(btn);
		});
	},

	/**
	 * @param {MenuGhostInput[]} ghosts
	 * @param {MenuGhostItem | string | null | undefined} currentGhost
	 */
	renderGhostSubmenu(
		this: MenuRendererContext,
		ghosts: MenuGhostInput[],
		currentGhost?: MenuGhostItem | string | null,
	) {
		const container = document.getElementById("ghost-submenu");
		if (!container) return;

		container.innerHTML = "";
		const currentName =
			typeof currentGhost === "string" ? currentGhost : currentGhost?.name;

		ghosts.forEach((ghost) => {
			const ghostName = typeof ghost === "string" ? ghost : ghost?.name || "";
			const isCurrent = Boolean(currentGhost) && currentName === ghostName;
			const btn = document.createElement("button");
			btn.type = "button";
			btn.className = `menu-item${isCurrent ? " is-current" : ""}`;
			btn.dataset.ghostName = ghostName;
			btn.innerHTML = `<span class="menu-item-indicator">${isCurrent ? "✓" : ""}</span><span class="menu-item-label">${ghostName}</span>`;
			btn.addEventListener("click", () => {
				this.dispatcher.dispatchAction("switch-to-ghost", ghostName);
			});
			container.appendChild(btn);
		});
	},

	/**
	 * @param {MenuGhostInput[]} ghosts
	 */
	renderCallGhostSubmenu(this: MenuRendererContext, ghosts: MenuGhostInput[]) {
		const container = document.getElementById("call-ghost-submenu");
		if (!container) return;

		container.innerHTML = "";

		ghosts.forEach((ghost) => {
			const ghostName = typeof ghost === "string" ? ghost : ghost?.name || "";
			const btn = document.createElement("button");
			btn.type = "button";
			btn.className = "menu-item";
			btn.dataset.ghostName = ghostName;
			btn.innerHTML = `<span class="menu-item-indicator">➕</span><span class="menu-item-label">${ghostName}</span>`;
			btn.addEventListener("click", () => {
				this.dispatcher.dispatchAction("call-ghost", ghostName);
			});
			container.appendChild(btn);
		});

		if (ghosts.length === 0) {
			const emptySpan = document.createElement("div");
			emptySpan.className = "menu-item is-disabled";
			emptySpan.innerHTML = `<span class="menu-item-indicator"></span><span class="menu-item-label">(ゴーストがありません)</span>`;
			container.appendChild(emptySpan);
		}
	},
};
