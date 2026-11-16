/**
 * @file menu-balloon-dressup-renderer.js
 * @brief バルーン、着せ替え、最近使ったものサブメニューの描画ロジック
 */
export const menuBalloonDressupRenderer = {
	/**
	 * @param {unknown[]} balloons
	 * @param {string | null} currentBalloonTheme
	 */
	renderBalloonSubmenu(balloons: unknown[], currentBalloonTheme: string) {
		const container = document.getElementById("balloon-submenu");
		if (!container) return;

		const activeTheme =
			currentBalloonTheme ||
			(typeof document !== "undefined"
				? document.documentElement.getAttribute("data-balloon-theme")
				: null) ||
			(typeof localStorage !== "undefined"
				? localStorage.getItem("nanai_balloon_theme")
				: null) ||
			"nsm";

		container.innerHTML = `
			<button type="button" class="menu-item" id="balloon-cycle-btn">
				<span class="menu-item-indicator">🔄</span>
				<span class="menu-item-label">次のスキンへ切り替え</span>
			</button>
			<div class="menu-separator"></div>
		`;

		const cycleBtn = container.querySelector("#balloon-cycle-btn");
		if (cycleBtn) {
			cycleBtn.addEventListener("click", () => {
				this.dispatcher.dispatchAction("balloon-cycle");
			});
		}

		if (balloons && balloons.length > 0) {
			balloons.forEach((balloon: { dir_name: unknown; name: unknown }) => {
				const currentNorm = String(activeTheme || "")
					.trim()
					.toLowerCase();
				const balloonDir = String(balloon.dir_name || "")
					.trim()
					.toLowerCase();
				const balloonName = String(balloon.name || "")
					.trim()
					.toLowerCase();
				const isCurrent =
					currentNorm === balloonDir || currentNorm === balloonName;

				const btn = document.createElement("button");
				btn.type = "button";
				btn.className = `menu-item${isCurrent ? " is-current" : ""}`;
				btn.dataset.action = `balloon-theme-${balloon.dir_name}`;
				btn.innerHTML = `<span class="menu-item-indicator">${isCurrent ? "✓" : ""}</span><span class="menu-item-label">${balloon.name}</span>`;

				btn.addEventListener("click", () => {
					this.dispatcher.dispatchAction(`balloon-theme-${balloon.dir_name}`);
				});
				container.appendChild(btn);
			});
		} else {
			const fallbackThemes = [
				{ id: "nsm", label: "NAMデフォルト+" },
				{ id: "nsm_vertical", label: "NAMデフォルト+(頭上)" },
			];
			fallbackThemes.forEach((t) => {
				const currentNorm = String(activeTheme || "")
					.trim()
					.toLowerCase();
				const isCurrent =
					currentNorm === t.id.toLowerCase() ||
					currentNorm === t.label.toLowerCase();

				const btn = document.createElement("button");
				btn.type = "button";
				btn.className = `menu-item${isCurrent ? " is-current" : ""}`;
				btn.dataset.action = `balloon-theme-${t.id}`;
				btn.innerHTML = `<span class="menu-item-indicator">${isCurrent ? "✓" : ""}</span><span class="menu-item-label">${t.label}</span>`;

				btn.addEventListener("click", () => {
					this.dispatcher.dispatchAction(`balloon-theme-${t.id}`);
				});
				container.appendChild(btn);
			});
		}
	},

	/**
	 * @param {{ sakura: object, kero: object }} dressup
	 * @param {number} [scope]
	 */
	renderDressupSubmenu(dressup: unknown, scope = 0) {
		const container = document.getElementById("dressup-submenu");
		if (!container) return;

		if (dressup) {
			this.dressupData = dressup;
		}

		container.innerHTML = "";

		const data =
			scope === 1 ? this.dressupData?.kero : this.dressupData?.sakura;
		const categories = data?.categories ?? [];
		if (categories.length === 0) {
			const empty = document.createElement("div");
			empty.className = "menu-item is-disabled";
			empty.innerHTML = `<span class="menu-item-indicator"></span><span class="menu-item-label">(着せ替えパーツなし)</span>`;
			container.appendChild(empty);
			return;
		}

		for (const cat of categories) {
			const label = document.createElement("div");
			label.className = "menu-item is-disabled";
			label.innerHTML = `<span class="menu-item-indicator"></span><span class="menu-item-label"><b>${cat.category}</b></span>`;
			container.appendChild(label);

			for (const part of cat.parts) {
				const btn = document.createElement("button");
				btn.type = "button";
				btn.className = `menu-item${part.on ? " is-current" : ""}`;
				btn.dataset.category = cat.category;
				btn.dataset.part = part.part;
				btn.innerHTML = `<span class="menu-item-indicator">${part.on ? "✓" : ""}</span><span class="menu-item-label">${part.part}</span>`;
				btn.addEventListener("click", () => {
					this.dispatcher.dispatchAction("dressup-toggle", {
						category: cat.category,
						part: part.part,
						scope,
					});
				});
				container.appendChild(btn);
			}
		}
	},

	/**
	 * @param {string[]} [recentGhosts]
	 */
	renderRecentSubmenu(recentGhosts = []) {
		const container = document.getElementById("recent-submenu");
		if (!container) return;

		container.innerHTML = "";

		if (!recentGhosts || recentGhosts.length === 0) {
			const empty = document.createElement("div");
			empty.className = "menu-item is-disabled";
			empty.innerHTML = `<span class="menu-item-indicator"></span><span class="menu-item-label">(履歴はありません)</span>`;
			container.appendChild(empty);
			return;
		}

		recentGhosts.forEach((item) => {
			const ghostName = typeof item === "string" ? item : item?.name || "";
			const hasSub =
				typeof item === "object" &&
				item !== null &&
				(item.hasSubmenu ||
					(item.subitems && item.subitems.length > 0) ||
					(item.shells && item.shells.length > 0));

			const btn = document.createElement("button");
			btn.type = "button";
			btn.className = `menu-item${hasSub ? " has-submenu" : ""}`;
			if (hasSub) {
				btn.setAttribute("aria-haspopup", "true");
			}
			btn.dataset.ghostName = ghostName;
			btn.innerHTML = `<span class="menu-item-indicator">🕘</span><span class="menu-item-label">${ghostName}</span>`;

			btn.addEventListener("click", () => {
				const action =
					typeof item === "object" && item?.action
						? item.action
						: "recent-ghost";
				this.dispatcher.dispatchAction(
					action,
					typeof item === "object" ? item : ghostName,
				);
			});
			container.appendChild(btn);
		});
	},
};
