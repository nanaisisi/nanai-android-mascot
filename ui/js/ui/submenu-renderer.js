/**
 * @file submenu-renderer.js
 * @brief 独立サブメニューウィンドウ内のコンテンツ（ゴースト、シェル、着せ替え、バルーン、履歴）描画処理
 */

/**
 * サブメニューの内容を描画するレンダラ
 */
export function renderSubmenuContent({
	currentSubmenuType,
	cachedGhosts,
	currentGhostName,
	cachedShells,
	currentShellName,
	cachedDressup,
	dressupScope,
	cachedBalloons,
	currentBalloonTheme,
	cachedRecentGhosts,
	dispatchSubmenuAction,
}) {
	const container = document.getElementById("submenu-content");
	if (!container) return;
	container.innerHTML = "";

	if (currentSubmenuType === "ghost") {
		cachedGhosts.forEach((ghostItem) => {
			const ghostName =
				typeof ghostItem === "string" ? ghostItem : ghostItem?.name || "";
			const isCurrent = ghostName === currentGhostName;
			const btn = document.createElement("button");
			btn.type = "button";
			btn.className = `menu-item${isCurrent ? " is-current" : ""}`;
			btn.innerHTML = `<span>${isCurrent ? "✓ " : ""}${ghostName}</span>`;
			btn.addEventListener("click", () => {
				dispatchSubmenuAction("switch-ghost", ghostName);
			});
			container.appendChild(btn);
		});
	} else if (currentSubmenuType === "shell") {
		(cachedShells.length > 0 ? cachedShells : ["master"]).forEach(
			(shellItem) => {
				const shellName =
					typeof shellItem === "string"
						? shellItem
						: shellItem?.name || "master";
				const displayName =
					typeof shellItem === "object" && shellItem?.display_name
						? shellItem.display_name
						: shellName;
				const btn = document.createElement("button");
				btn.type = "button";
				btn.className = `menu-item${shellName === currentShellName ? " is-current" : ""}`;
				btn.innerHTML = `<span>${shellName === currentShellName ? "✓ " : ""}${displayName}</span>`;
				btn.addEventListener("click", () => {
					dispatchSubmenuAction("switch-shell", shellName);
				});
				container.appendChild(btn);
			},
		);
	} else if (currentSubmenuType === "dressup") {
		const data =
			dressupScope === 1 ? cachedDressup?.kero : cachedDressup?.sakura;
		const categories = data?.categories ?? [];
		if (categories.length === 0) {
			const empty = document.createElement("div");
			empty.className = "menu-item is-disabled";
			empty.innerHTML = `<span>(着せ替えパーツなし)</span>`;
			container.appendChild(empty);
		}
		for (const cat of categories) {
			const label = document.createElement("div");
			label.className = "menu-item is-disabled";
			label.innerHTML = `<span>${cat.category}</span>`;
			container.appendChild(label);

			for (const part of cat.parts) {
				const btn = document.createElement("button");
				btn.type = "button";
				btn.className = `menu-item${part.on ? " is-current" : ""}`;
				btn.innerHTML = `<span>${part.on ? "✓ " : "　"}${part.part}</span>`;
				btn.addEventListener("click", () => {
					dispatchSubmenuAction("dressup-toggle", {
						category: cat.category,
						part: part.part,
						scope: dressupScope,
					});
				});
				container.appendChild(btn);
			}
		}
	} else if (currentSubmenuType === "balloon") {
		(cachedBalloons.length > 0
			? cachedBalloons
			: [
					{ dir_name: "ivory", name: "アイボリー" },
					{ dir_name: "pixel", name: "ピクセル" },
					{ dir_name: "comic", name: "コミック" },
					{ dir_name: "dark", name: "ダーク" },
				]
		).forEach((balloonItem) => {
			const dirName = balloonItem.dir_name || balloonItem.name;
			const displayName = balloonItem.name || dirName;
			const isCurrent = dirName === currentBalloonTheme;
			const btn = document.createElement("button");
			btn.type = "button";
			btn.className = `menu-item${isCurrent ? " is-current" : ""}`;
			btn.innerHTML = `<span>${isCurrent ? "✓ " : ""}${displayName}</span>`;
			btn.addEventListener("click", () => {
				dispatchSubmenuAction(`balloon-theme-${dirName}`);
			});
			container.appendChild(btn);
		});
	} else if (currentSubmenuType === "recent") {
		if (!cachedRecentGhosts || cachedRecentGhosts.length === 0) {
			const empty = document.createElement("div");
			empty.className = "menu-item is-disabled";
			empty.innerHTML = `<span>(最近使った履歴なし)</span>`;
			container.appendChild(empty);
			return;
		}
		cachedRecentGhosts.forEach((ghostName) => {
			const btn = document.createElement("button");
			btn.type = "button";
			btn.className = "menu-item";
			btn.innerHTML = `<span>${ghostName}</span>`;
			btn.addEventListener("click", () => {
				dispatchSubmenuAction("recent-ghost", ghostName);
			});
			container.appendChild(btn);
		});
	}
}
