/**
 * コンテキストメニューの各サブメニュー（ゴースト、シェル、呼び出し）描画
 */
export class MenuSubmenuRenderer {
	/**
	 * @param {import('./menu-dispatcher.js').MenuDispatcher} dispatcher
	 */
	constructor(dispatcher) {
		this.dispatcher = dispatcher;
	}

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
	}

	renderGhostSubmenu(ghosts, currentGhost) {
		const container = document.getElementById("ghost-submenu");
		if (!container) return;

		container.innerHTML = "";

		// 検出されたゴースト一覧
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

		// セパレータ
		if (ghosts.length > 0) {
			const sep = document.createElement("div");
			sep.className = "menu-separator";
			container.appendChild(sep);
		}

		// ゴースト管理モーダルを開くボタン
		const manageBtn = document.createElement("button");
		manageBtn.className = "menu-item";
		manageBtn.id = "ghost-btn";
		manageBtn.innerHTML = `<span>📂 ゴースト管理...</span>`;
		manageBtn.addEventListener("click", () => {
			this.dispatcher.dispatchAction("ghost");
		});
		container.appendChild(manageBtn);

		// ゴースト取り込みモーダルを開くボタン
		const installBtn = document.createElement("button");
		installBtn.className = "menu-item";
		installBtn.id = "install-btn";
		installBtn.innerHTML = `<span>📥 ゴーストの取り込み...</span>`;
		installBtn.addEventListener("click", () => {
			this.dispatcher.dispatchAction("install");
		});
		container.appendChild(installBtn);
	}

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
	}

	/**
	 * 着せ替え (bindgroup) サブメニュー描画 (UKADOC オーナードローメニュー)
	 * カテゴリ見出し + パーツ切替トグル。
	 * @param {{ sakura: object, kero: object }} dressup - dressupMenuPayload 出力
	 * @param {number} [scope] - メニュー対象スコープ (0 = さくら / 1 = うにゅ)
	 */
	renderDressupSubmenu(dressup, scope = 0) {
		const container = document.getElementById("dressup-submenu");
		if (!container) return;

		// 最新データを保持し、scope 変更時の再描画に備える
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
	}

	applyTheme(theme) {
		if (theme) {
			document.documentElement.setAttribute("data-balloon-theme", theme);
			document.body.className = `balloon-theme-${theme}`;
		}
	}

	applyShellTheme(activeShell) {
		const rootStyle = document.documentElement.style;
		if (activeShell?.menu_theme) {
			const mt = activeShell.menu_theme;
			if (mt.background_color)
				rootStyle.setProperty("--balloon-bg", mt.background_color);
			if (mt.foreground_color)
				rootStyle.setProperty("--balloon-highlight-bg", mt.foreground_color);
			if (mt.background_font_color || mt.font_color) {
				rootStyle.setProperty(
					"--balloon-text-color",
					mt.background_font_color || mt.font_color,
				);
			}
			if (mt.foreground_font_color)
				rootStyle.setProperty(
					"--balloon-highlight-text",
					mt.foreground_font_color,
				);
			if (mt.disable_font_color)
				rootStyle.setProperty("--balloon-disable-text", mt.disable_font_color);
			if (mt.separator_color)
				rootStyle.setProperty("--balloon-separator-color", mt.separator_color);

			// オーナードロー画像 (背景・ハイライト・サイドバー)
			const shellPath = activeShell.path || "";
			const resolveImg = (relPath) => {
				if (!relPath) return null;
				const full = shellPath
					? `${shellPath.replace(/\\/g, "/")}/${relPath.replace(/\\/g, "/")}`
					: relPath;
				return globalThis.__TAURI__?.core?.convertFileSrc
					? globalThis.__TAURI__.core.convertFileSrc(full)
					: full;
			};

			if (mt.background_bitmap) {
				const bgUrl = resolveImg(mt.background_bitmap);
				rootStyle.setProperty("--menu-bg-image", `url("${bgUrl}")`);
			} else {
				rootStyle.removeProperty("--menu-bg-image");
			}

			if (mt.foreground_bitmap) {
				const fgUrl = resolveImg(mt.foreground_bitmap);
				rootStyle.setProperty("--menu-fg-image", `url("${fgUrl}")`);
			} else {
				rootStyle.removeProperty("--menu-fg-image");
			}

			if (mt.sidebar_bitmap) {
				const sideUrl = resolveImg(mt.sidebar_bitmap);
				rootStyle.setProperty("--menu-sidebar-image", `url("${sideUrl}")`);
				document.body.classList.add("has-sidebar");
			} else {
				rootStyle.removeProperty("--menu-sidebar-image");
				document.body.classList.remove("has-sidebar");
			}
		} else {
			rootStyle.removeProperty("--menu-bg-image");
			rootStyle.removeProperty("--menu-fg-image");
			rootStyle.removeProperty("--menu-sidebar-image");
			document.body.classList.remove("has-sidebar");
		}
	}
}
