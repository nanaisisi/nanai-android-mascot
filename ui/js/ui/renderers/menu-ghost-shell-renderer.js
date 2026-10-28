/**
 * @file menu-ghost-shell-renderer.js
 * @brief ゴーストおよびシェル切り替えサブメニューの描画ロジック
 */
export const menuGhostShellRenderer = {
	/**
	 * @param {any[]} shells
	 * @param {any} currentShell
	 */
	renderShellSubmenu(shells, currentShell) {
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
			btn.className = `menu-item ${isCurrent ? "is-current" : ""}`;
			btn.dataset.shellName = shellName;
			btn.innerHTML = `<span>${isCurrent ? "✓ " : "　"}${displayName}</span>`;
			btn.addEventListener("click", () => {
				this.dispatcher.dispatchAction("switch-to-shell", shellName);
			});
			container.appendChild(btn);
		});
	},

	/**
	 * @param {any[]} ghosts
	 * @param {{ name: any; }} currentGhost
	 */
	renderGhostSubmenu(ghosts, currentGhost) {
		const container = document.getElementById("ghost-submenu");
		if (!container) return;

		container.innerHTML = "";

		ghosts.forEach((ghost) => {
			const isCurrent = currentGhost && currentGhost.name === ghost.name;
			const btn = document.createElement("button");
			btn.className = `menu-item ${isCurrent ? "is-current" : ""}`;
			btn.dataset.ghostName = ghost.name;
			btn.innerHTML = `<span>${isCurrent ? "✓ " : "　"}${ghost.name}</span>`;
			btn.addEventListener("click", () => {
				this.dispatcher.dispatchAction("switch-to-ghost", ghost.name);
			});
			container.appendChild(btn);
		});
	},

	/**
	 * @param {any[]} ghosts
	 */
	renderCallGhostSubmenu(ghosts) {
		const container = document.getElementById("call-ghost-submenu");
		if (!container) return;

		container.innerHTML = "";

		ghosts.forEach((ghost) => {
			const btn = document.createElement("button");
			btn.className = "menu-item";
			btn.dataset.ghostName = ghost.name;
			btn.innerHTML = `<span>➕ ${ghost.name}</span>`;
			btn.addEventListener("click", () => {
				this.dispatcher.dispatchAction("call-ghost", ghost.name);
			});
			container.appendChild(btn);
		});

		if (ghosts.length === 0) {
			const emptySpan = document.createElement("div");
			emptySpan.className = "menu-item is-disabled";
			emptySpan.innerHTML = `<span>(ゴーストがありません)</span>`;
			container.appendChild(emptySpan);
		}
	},
};
