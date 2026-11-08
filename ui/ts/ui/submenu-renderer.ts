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

	if (currentSubmenuType === "ghost" || currentSubmenuType === "call-ghost") {
		const isCall = currentSubmenuType === "call-ghost";
		if (!cachedGhosts || cachedGhosts.length === 0) {
			const empty = document.createElement("div");
			empty.className = "menu-item is-disabled";
			empty.innerHTML = `<span>(ゴーストなし)</span>`;
			container.appendChild(empty);
			return;
		}
		cachedGhosts.forEach((ghostItem: { name: unknown }) => {
			const ghostName =
				typeof ghostItem === "string" ? ghostItem : ghostItem?.name || "";
			const isCurrent = !isCall && ghostName === currentGhostName;
			const btn = document.createElement("button");
			btn.type = "button";
			btn.className = `menu-item${isCurrent ? " is-current" : ""}`;
			btn.innerHTML = `<span>${isCurrent ? "✓ " : ""}${ghostName}</span>`;
			btn.addEventListener("click", () => {
				dispatchSubmenuAction(
					isCall ? "call-ghost" : "switch-ghost",
					ghostName,
				);
			});
			container.appendChild(btn);
		});
	} else if (currentSubmenuType === "shell") {
		(cachedShells.length > 0 ? cachedShells : ["master"]).forEach(
			(shellItem: { name: unknown; display_name: unknown }) => {
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
					{ dir_name: "nam_default_plus", name: "NAMデフォルト+" },
					{
						dir_name: "nam_default_plus_overhead",
						name: "NAMデフォルト+(頭上)",
					},
				]
		).forEach((balloonItem: { dir_name: unknown; name: unknown }) => {
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
		cachedRecentGhosts.forEach(
			(
				item: {
					name: unknown;
					hasSubmenu: unknown;
					subitems: string | unknown[];
					shells: string | unknown[];
					action: unknown;
				} | null,
			) => {
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
				btn.innerHTML = `<span>${ghostName}</span>`;
				btn.addEventListener("click", () => {
					const action =
						typeof item === "object" && item?.action
							? item.action
							: "recent-ghost";
					dispatchSubmenuAction(
						action,
						typeof item === "object" ? item : ghostName,
					);
				});
				container.appendChild(btn);
			},
		);
	} else if (
		currentSubmenuType === "utility" ||
		currentSubmenuType === "utility-root" ||
		currentSubmenuType === "tools"
	) {
		const utilityItems = [
			{ action: "calendar", label: "カレンダー (C)", shortcut: "Ctrl+D" },
			{ action: "sspim", label: "SSPメッセンジャ (M)", shortcut: "Ctrl+M" },
			{ action: "sntp", label: "時刻合わせ (N)", shortcut: "" },
			{ action: "explorer", label: "エクスプローラ (E)", shortcut: "Ctrl+E" },
			{ action: "pictureviewer", label: "画像ビューワ", shortcut: "" },
			{ action: "archiveviewer", label: "アーカイブビューワ", shortcut: "" },
			{ action: "backlog", label: "バックログ/発言履歴", shortcut: "Ctrl+B" },
			{ action: "updatecheck", label: "本体更新をチェック (U)", shortcut: "" },
			{ action: "speech-recognition", label: "音声認識", shortcut: "" },
			{ action: "speech-synthesis", label: "音声合成 (V)", shortcut: "" },
			{ action: "addressbar", label: "アドレスバー (A)", shortcut: "" },
			{ action: "open-file", label: "ファイルを開く (1)", shortcut: "Ctrl+O" },
			{
				action: "open-folder",
				label: "フォルダを選択する (S)",
				shortcut: "Ctrl+Shift+U",
			},
			{
				action: "clear-cache",
				label: "ゴーストキャッシュ開放 (G)",
				shortcut: "Ctrl+F",
			},
			{ action: "update-fmo", label: "FMOの整理/更新 (E)", shortcut: "" },
			{ action: "reload-info", label: "動作情報再読み込み (R)", shortcut: "" },
			{ action: "reload-ghost", label: "ゴースト再読み込み (○)", shortcut: "" },
			{
				action: "keep-temporary-ghost",
				label: "一時起動ゴーストを保持 (K)",
				shortcut: "Ctrl+K",
			},
			{
				action: "reset-shell-position",
				label: "シェル位置初期化 (H)",
				shortcut: "Ctrl+Shift+F12",
			},
			{
				action: "reset-balloon-position",
				label: "バルーン位置初期化 (N)",
				shortcut: "Ctrl+Shift+F10",
			},
			{
				action: "close-balloon",
				label: "バルーンを消す (B)",
				shortcut: "Ctrl+Shift+Del",
			},
		];
		utilityItems.forEach((item) => {
			const btn = document.createElement("button");
			btn.type = "button";
			btn.className = "menu-item";
			btn.innerHTML = `<span>${item.label}</span>${item.shortcut ? `<span style="opacity:0.6; font-size:0.75rem; margin-left:8px;">${item.shortcut}</span>` : ""}`;
			btn.addEventListener("click", () => {
				dispatchSubmenuAction(item.action);
			});
			container.appendChild(btn);
		});
	}
}
