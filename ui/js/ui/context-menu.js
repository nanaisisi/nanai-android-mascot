import {
	invoke,
	isTauriAvailable,
	listen,
	startDraggingWindow,
} from "../core/tauri-helper.js";
import { MenuDispatcher } from "./menu-dispatcher.js";
import { MenuSubmenuRenderer } from "./menu-submenu-renderer.js";

const dispatcher = new MenuDispatcher();
const renderer = new MenuSubmenuRenderer(dispatcher);

document.addEventListener("mousedown", (event) => {
	if (event.button !== 0 || !isTauriAvailable()) return;
	if (event.target.closest(".menu-item, .submenu-container")) return;
	startDraggingWindow();
});

// 独立ウィンドウ環境での Tauri イベント受信 (ゴースト・シェル・バルーンテーマ同期・スコープ同期)
if (isTauriAvailable()) {
	listen("sync-menu-scope", (event) => {
		const scope =
			typeof event.payload === "number"
				? event.payload
				: parseInt(event.payload, 10);
		if (!Number.isNaN(scope)) {
			dispatcher.setScope(scope);
			// 着せ替えサブメニューを新スコープのパーツ定義へ切替
			renderer.renderDressupSubmenu(null, scope);
			// 新しいスコープに合わせた最新状態の同期を要求
			dispatcher.dispatchAction("request-sync");
		}
	});
	listen("sync-ghosts", (event) => {
		const data = event.payload;
		if (data) {
			if (
				typeof data.scope === "number" &&
				data.scope !== dispatcher.currentScope
			) {
				dispatcher.setScope(data.scope);
			}
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
			// 最近使ったもの (ゴースト実行履歴)
			renderer.renderRecentSubmenu(data.recentGhosts || []);
			// ゴースト/シェルの descript.txt 由来のメニュー配色を適用
			const activeShell =
				data.shells?.find((s) => s.name === data.currentShell) ||
				data.shells?.[0];
			renderer.applyShellTheme(activeShell);
		}
	});
	listen("sync-theme", (event) => {
		renderer.applyTheme(event.payload);
		if (globalThis._lastBalloons) {
			renderer.renderBalloonSubmenu(globalThis._lastBalloons, event.payload);
		}
	});
	listen("sync-balloons", (event) => {
		globalThis._lastBalloons = event.payload;
		renderer.renderBalloonSubmenu(
			event.payload,
			document.documentElement.getAttribute("data-balloon-theme"),
		);
	});
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
		// 最近使ったもの (ゴースト実行履歴)
		renderer.renderRecentSubmenu(event.data.recentGhosts || []);
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
		if (globalThis._lastBalloons) {
			renderer.renderBalloonSubmenu(globalThis._lastBalloons, event.data.theme);
		}
	} else if (event.data?.type === "sync-balloons") {
		globalThis._lastBalloons = event.data.balloons;
		renderer.renderBalloonSubmenu(
			event.data.balloons,
			document.documentElement.getAttribute("data-balloon-theme"),
		);
	}
});

// 独立サブメニューウィンドウを開く補助関数 (デスクトップ環境用)
function _triggerSubmenuWindow(menuType, buttonEl) {
	const now = Date.now();
	const last = _triggerSubmenuWindow.lastRequest;
	if (last?.type === menuType && now - last.time < 180) return;
	_triggerSubmenuWindow.lastRequest = { type: menuType, time: now };

	if (isTauriAvailable()) {
		const rect = buttonEl.getBoundingClientRect();
		const sX = globalThis.screenX ?? 0;
		const sY = globalThis.screenY ?? 0;
		const posX = sX + 240 + 2;
		const posY = sY + rect.top;
		invoke("show_submenu_window", {
			menuType: menuType,
			x: posX,
			y: posY,
			width: 220,
			height: 320,
		}).catch((e) => {
			console.error("Failed to show submenu window:", e);
			const wrapper = buttonEl.closest(".menu-item-wrapper");
			if (wrapper) {
				checkSubmenuFlip(wrapper);
				wrapper.classList.add("open");
			}
		});
		_triggerSubmenuWindow.lastRequest = null;
	}
}

document.addEventListener("click", (e) => {
	const menuItem = e.target.closest(".menu-item");
	if (!menuItem) return;

	// サブメニュー展開用の親ボタン
	if (menuItem.classList.contains("has-submenu")) {
		const menuType = menuItem.id
			.replace("-menu-btn", "")
			.replace("-switch-btn", "")
			.replace("-btn", "");
		if (isTauriAvailable()) {
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
		if (isTauriAvailable()) {
			const btn = wrapper.querySelector(".menu-item.has-submenu");
			if (btn) {
				const menuType = btn.id
					.replace("-menu-btn", "")
					.replace("-switch-btn", "")
					.replace("-btn", "");
				_triggerSubmenuWindow(menuType, btn);
			}
		} else {
			wrapper.classList.add("open");
		}
	});
	wrapper.addEventListener("mouseleave", () => {
		if (!isTauriAvailable()) {
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
		} else if (e.key.toLowerCase() === "k") {
			e.preventDefault();
			dispatcher.dispatchAction("keep-temporary-ghost");
		} else if (e.shiftKey && e.key.toLowerCase() === "f12") {
			e.preventDefault();
			dispatcher.dispatchAction("reset-shell-position");
		} else if (e.shiftKey && e.key.toLowerCase() === "f10") {
			e.preventDefault();
			dispatcher.dispatchAction("reset-balloon-position");
		} else if (
			e.shiftKey &&
			(e.key === "Delete" || e.key === "Del" || e.key.toLowerCase() === "del")
		) {
			e.preventDefault();
			dispatcher.dispatchAction("close-balloon");
		}
		return;
	}

	// 単一アクセラレータキー (SSP標準キーバインド準拠)
	const keyMap = {
		r: "recommend", // おすすめ (Recommend)
		t: "portal", // ポータルサイト (Portal)
		u: "update", // ネットワーク更新 (Update)
		d: "uninstall-ghost", // アンインストール (Delete)
		h: "headline", // RSS/ヘッドライン (Headline)
		p: "plugins", // プラグイン (Plugins)
		m: "biff", // メールチェック (Mail)
		f: "tools", // 機能 (Functions)
		o: "settings", // 設定 (Options)
		g: "ghost", // ゴースト切り替え (Ghost)
		c: "dressup", // 着せ替え (Clothing)
		b: "balloon", // バルーン (Balloon)
		a: "help", // 情報 (About)
		i: "minimize", // アイコン化 (Iconize)
		w: "close", // 終了 (Window close)
		x: "close-all", // 全て終了 (Exit all)
	};

	const action = keyMap[e.key.toLowerCase()];
	if (action) {
		e.preventDefault();
		dispatcher.dispatchAction(action);
	}
});
