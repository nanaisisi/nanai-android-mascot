/**
 * @file menu-balloon-dressup-renderer.js
 * @brief バルーン、着せ替え、最近使ったものサブメニューの描画ロジック
 */
export const menuBalloonDressupRenderer = {
	/**
	 * @param {any[]} balloons
	 * @param {string | null} currentBalloonTheme
	 */
	renderBalloonSubmenu(balloons, currentBalloonTheme) {
		const container = document.getElementById("balloon-submenu");
		if (!container) return;

		container.innerHTML = `
			<button type="button" class="menu-item" id="balloon-cycle-btn">
				<span>🔄 次のスキンへ切り替え</span>
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
			balloons.forEach((balloon) => {
				const isCurrent = currentBalloonTheme === balloon.dir_name;
				const btn = document.createElement("button");
				btn.className = `menu-item ${isCurrent ? "is-current" : ""}`;
				btn.dataset.action = `balloon-theme-${balloon.dir_name}`;

				const span = document.createElement("span");
				span.textContent = `${isCurrent ? "✓ " : "　"}${balloon.name}`;
				btn.appendChild(span);

				btn.addEventListener("click", () => {
					this.dispatcher.dispatchAction(`balloon-theme-${balloon.dir_name}`);
				});
				container.appendChild(btn);
			});
		} else {
			const fallbackThemes = [
				{ id: "ivory", label: "アイボリー (Ivory)" },
				{ id: "pixel", label: "ピクセル (Pixel)" },
				{ id: "comic", label: "コミック (Comic)" },
				{ id: "dark", label: "ダーク (Dark)" },
			];
			fallbackThemes.forEach((t) => {
				const isCurrent = currentBalloonTheme === t.id;
				const btn = document.createElement("button");
				btn.className = `menu-item ${isCurrent ? "is-current" : ""}`;
				btn.dataset.action = `balloon-theme-${t.id}`;

				const span = document.createElement("span");
				span.textContent = `${isCurrent ? "✓ " : "　"}${t.label}`;
				btn.appendChild(span);

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
	renderDressupSubmenu(dressup, scope = 0) {
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
			empty.innerHTML = `<span>(着せ替えパーツなし)</span>`;
			container.appendChild(empty);
			return;
		}

		for (const cat of categories) {
			const label = document.createElement("div");
			label.className = "menu-item is-disabled";
			label.innerHTML = `<span>${cat.category}</span>`;
			container.appendChild(label);

			for (const part of cat.parts) {
				const btn = document.createElement("button");
				btn.type = "button";
				btn.className = `menu-item ${part.on ? "is-current" : ""}`;
				btn.dataset.category = cat.category;
				btn.dataset.part = part.part;
				btn.innerHTML = `<span>${part.on ? "✓ " : "　"}${part.part}</span>`;
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

		if (recentGhosts.length === 0) {
			const empty = document.createElement("div");
			empty.className = "menu-item is-disabled";
			empty.innerHTML = `<span>(履歴はありません)</span>`;
			container.appendChild(empty);
			return;
		}

		recentGhosts.forEach((ghostName) => {
			const btn = document.createElement("button");
			btn.className = "menu-item";
			btn.dataset.ghostName = ghostName;
			btn.innerHTML = `<span>🕘 ${ghostName}</span>`;
			btn.addEventListener("click", () => {
				this.dispatcher.dispatchAction("recent-ghost", ghostName);
			});
			container.appendChild(btn);
		});
	},
};
