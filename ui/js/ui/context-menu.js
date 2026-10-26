import { MenuDispatcher } from "./menu-dispatcher.js";
import { MenuSubmenuRenderer } from "./menu-submenu-renderer.js";

const dispatcher = new MenuDispatcher();
const renderer = new MenuSubmenuRenderer(dispatcher);

// 独立ウィンドウ環境での Tauri イベント受信 (ゴースト・シェル・バルーンテーマ同期・スコープ同期)
if (globalThis.__TAURI__) {
	const listenFn =
		globalThis.__TAURI__.event?.listen || globalThis.__TAURI__.listen;
	if (typeof listenFn === "function") {
		listenFn("sync-menu-scope", (event) => {
			const scope =
				typeof event.payload === "number"
					? event.payload
					: parseInt(event.payload, 10);
			if (!Number.isNaN(scope)) {
				dispatcher.setScope(scope);
				// 着せ替えサブメニューを新スコープのパーツ定義へ切替
				renderer.renderDressupSubmenu(null, scope);
			}
		});
		listenFn("sync-ghosts", (event) => {
			const data = event.payload;
			if (data) {
				renderer.renderGhostSubmenu(data.ghosts || [], data.currentGhost);
				renderer.renderCallGhostSubmenu(data.ghosts || []);
				if (data.shells) {
					renderer.renderShellSubmenu(data.shells, data.currentShell);
				}
				// 着せ替え (bindgroup) メニューをスコープに合わせて再描画
				if (data.dressup) {
					renderer.renderDressupSubmenu(
						data.dressup,
						data.scope ?? dispatcher.currentScope,
					);
				}
				// ゴースト/シェルの descript.txt 由来のメニュー配色を適用
				const activeShell =
					data.shells?.find((s) => s.name === data.currentShell) ||
					data.shells?.[0];
				renderer.applyShellTheme(activeShell);
			}
		});
		listenFn("sync-theme", (event) => {
			renderer.applyTheme(event.payload);
		});
	}
}

// 親ウィンドウからの状態同期メッセージ受信 (iframeフォールバック時)
globalThis.addEventListener("message", (event) => {
	if (event.data?.type === "sync-scope") {
		const scope =
			typeof event.data.scope === "number"
				? event.data.scope
				: parseInt(event.data.scope, 10);
		if (!Number.isNaN(scope)) {
			dispatcher.setScope(scope);
			renderer.renderDressupSubmenu(null, scope);
		}
	} else if (event.data?.type === "sync-ghosts") {
		renderer.renderGhostSubmenu(
			event.data.ghosts || [],
			event.data.currentGhost,
		);
		// 着せ替え (bindgroup) メニューをスコープに合わせて再描画
		if (event.data.dressup) {
			renderer.renderDressupSubmenu(
				event.data.dressup,
				event.data.scope ?? dispatcher.currentScope,
			);
		}
	} else if (event.data?.type === "sync-shells") {
		renderer.renderShellSubmenu(
			event.data.shells || ["master"],
			event.data.currentShell || "master",
		);
		const activeShell =
			event.data.shells?.find((s) => s.name === event.data.currentShell) ||
			event.data.shells?.[0];
		if (activeShell) {
			renderer.applyShellTheme(activeShell);
		}
	} else if (event.data?.type === "sync-theme") {
		renderer.applyTheme(event.data.theme);
	}
});

// 独立サブメニューウィンドウを開く補助関数 (デスクトップ環境用)
function _triggerSubmenuWindow(menuType, buttonEl) {
	if (globalThis.__TAURI__) {
		const invokeFn =
			globalThis.__TAURI__.core?.invoke || globalThis.__TAURI__.invoke;
		if (typeof invokeFn === "function") {
			const rect = buttonEl.getBoundingClientRect();
			const sX = globalThis.screenX ?? 0;
			const sY = globalThis.screenY ?? 0;
			const posX = sX + 240 + 2;
			const posY = sY + rect.top;
			invokeFn("show_submenu_window", {
				menuType: menuType,
				x: posX,
				y: posY,
				width: 220,
				height: 320,
			}).catch((e) => console.error("Failed to show submenu window:", e));
		}
	}
}

document.addEventListener("click", (e) => {
	const menuItem = e.target.closest(".menu-item");
	if (!menuItem) return;

	// サブメニュー展開用の親ボタン
	if (menuItem.classList.contains("has-submenu")) {
		const menuType = menuItem.id
			.replace("-menu-btn", "")
			.replace("-switch-btn", "");
		if (globalThis.__TAURI__) {
			_triggerSubmenuWindow(menuType, menuItem);
			return;
		}

		const wrapper = menuItem.closest(".menu-item-wrapper");
		if (wrapper) {
			const isAlreadyOpen = wrapper.classList.contains("open");
			document.querySelectorAll(".menu-item-wrapper.open").forEach((el) => {
				el.classList.remove("open");
			});
			if (!isAlreadyOpen) {
				checkSubmenuFlip(wrapper);
				wrapper.classList.add("open");
			}
		}
		return;
	}

	const action = menuItem.dataset.action || menuItem.id.replace("-btn", "");
	dispatcher.dispatchAction(action);
});

// SSP準拠: サブメニューが画面右端を超える場合は左側へ反転展開
function checkSubmenuFlip(wrapper) {
	const container = document.querySelector(".menu-container");
	if (!container) return;

	const containerRect = container.getBoundingClientRect();
	const submenuWidth = 240;
	const spaceOnRight = (globalThis.innerWidth ?? 800) - containerRect.right;

	if (spaceOnRight < submenuWidth) {
		wrapper.classList.add("flip-left");
	} else {
		wrapper.classList.remove("flip-left");
	}
}

// ホバー時にも右/左展開を判定 & 独立サブメニューウィンドウ呼び出し
document.querySelectorAll(".menu-item-wrapper").forEach((wrapper) => {
	wrapper.addEventListener("mouseenter", () => {
		checkSubmenuFlip(wrapper);
		if (globalThis.__TAURI__) {
			const btn = wrapper.querySelector(".menu-item.has-submenu");
			if (btn) {
				const menuType = btn.id
					.replace("-menu-btn", "")
					.replace("-switch-btn", "");
				_triggerSubmenuWindow(menuType, btn);
			}
		} else {
			wrapper.classList.add("open");
		}
	});
	wrapper.addEventListener("mouseleave", () => {
		if (!globalThis.__TAURI__) {
			wrapper.classList.remove("open");
		}
	});
});

// 初期化時に親ウィンドウへ同期リクエスト & 保存済みテーマの即時適用
globalThis.addEventListener("DOMContentLoaded", () => {
	try {
		const savedTheme = localStorage.getItem("nanai_balloon_theme");
		if (savedTheme) {
			renderer.applyTheme(savedTheme);
		}
	} catch (_err) {
		// LocalStorage access restricted or unavailable
	}
	dispatcher.dispatchAction("request-sync");
});

// ショートカットキー対応 (T, B, R, P, O, D, A, C, Ctrl+I, Ctrl+W, Escape)
document.addEventListener("keydown", (e) => {
	if (e.key === "Escape") {
		dispatcher.dispatchAction("close-menu");
		return;
	}

	if (e.ctrlKey || e.metaKey) {
		if (e.key.toLowerCase() === "i") {
			e.preventDefault();
			dispatcher.dispatchAction("minimize");
		} else if (e.key.toLowerCase() === "w") {
			e.preventDefault();
			dispatcher.dispatchAction("close");
		} else if (e.key.toLowerCase() === "q") {
			e.preventDefault();
			dispatcher.dispatchAction("close-all");
		}
		return;
	}

	// 単一アクセラレータキー (SSP標準キーバインド準拠)
	const keyMap = {
		a: "talk", // もう一度話す (Again)
		r: "recommend", // おすすめサイト (Recommend)
		t: "portal", // ポータル (Portal)
		u: "update", // ネットワーク更新 (Update)
		c: "updatecheck", // ネットワーク更新チェックのみ (Check)
		b: "balloon", // バルーン (Balloon)
		f: "tools", // ツール
		i: "install", // ファイル導入
		o: "settings", // 設定 (Options)
		h: "help", // 情報・ヘルプ (Help)
		l: "license", // 著作権・ライセンス (License)
		m: "minimize", // 最小化 (Minimize)
		w: "close", // 終了
		x: "close-all", // 全て終了 (Exit all)
	};

	const action = keyMap[e.key.toLowerCase()];
	if (action) {
		e.preventDefault();
		dispatcher.dispatchAction(action);
	}
});
