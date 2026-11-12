import { invoke, isTauriAvailable } from "../core/tauri-helper.js";
import { handleMenuKeydown } from "./context-menu-keyboard.js";
import { setupContextMenuSync } from "./context-menu-sync.js";
import { MenuDispatcher } from "./menu-dispatcher.js";
import { MenuSubmenuRenderer } from "./menu-submenu-renderer.js";

export { handleMenuKeydown, MENU_KEY_MAP } from "./context-menu-keyboard.js";
export { setupContextMenuSync } from "./context-menu-sync.js";

const dispatcher = new MenuDispatcher();
const renderer = new MenuSubmenuRenderer(dispatcher);

/**
 * [Design Invariant / 設計仕様]
 * コンテキストメニューウィンドウは固定ポップアップとして表示されるため、
 * キャラクターやバルーンウィンドウとは異なり、ドラッグ移動不可（非ドラッグ）仕様です。
 * 誤ってウィンドウドラッグ機能（startDraggingWindow）を追加しないよう注意してください。
 */

// Tauri / iframe 同期リスナー初期化
setupContextMenuSync(dispatcher, renderer);

// 独立サブメニューウィンドウを開く補助関数 (デスクトップ環境用)
function _triggerSubmenuWindow(menuType: string, buttonEl: Element) {
	const now = Date.now();
	const last = _triggerSubmenuWindow.lastRequest;
	if (last?.type === menuType && now - last.time < 180) return;
	_triggerSubmenuWindow.lastRequest = { type: menuType, time: now };

	if (isTauriAvailable()) {
		const rect = buttonEl.getBoundingClientRect();
		const sX = globalThis.screenX ?? 0;
		const sY = globalThis.screenY ?? 0;
		const posX = sX + 260 + 2;
		const posY = sY + rect.top;
		invoke("show_submenu_window", {
			menuType: menuType,
			x: posX,
			y: posY,
			width: 220,
			height: 300,
		}).catch((e) => {
			console.error("Failed to show submenu window:", e);
			const wrapper = buttonEl.closest(".menu-item-wrapper");
			if (wrapper) {
				checkSubmenuFlip(wrapper);
				wrapper.classList.add("open");
			}
		});
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
function checkSubmenuFlip(wrapper: Element) {
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
document.addEventListener("mouseover", (e: unknown) => {
	const btn = e.target.closest(".menu-item.has-submenu");
	if (!btn) return;
	const wrapper = btn.closest(".menu-item-wrapper") || btn.parentElement;
	if (wrapper) {
		checkSubmenuFlip(wrapper);
	}
	const menuType = btn.id
		.replace("-menu-btn", "")
		.replace("-switch-btn", "")
		.replace("-btn", "");
	if (isTauriAvailable()) {
		_triggerSubmenuWindow(menuType, btn);
	} else if (wrapper) {
		document.querySelectorAll(".menu-item-wrapper.open").forEach((el) => {
			if (el !== wrapper) el.classList.remove("open");
		});
		wrapper.classList.add("open");
	}
});

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
	handleMenuKeydown(e, dispatcher);
});

async function adjustMenuWindowSize() {
	if (!isTauriAvailable()) return;
	try {
		const { getCurrentWindow } = await import("@tauri-apps/api/window");
		const win = getCurrentWindow();
		const container = document.querySelector(".menu-container");
		const containerHeight = container
			? container.getBoundingClientRect().height
			: 0;
		const bodyHeight =
			containerHeight ||
			document.body.scrollHeight ||
			document.documentElement.scrollHeight;
		if (bodyHeight > 50) {
			const targetHeight = Math.min(650, Math.max(140, Math.ceil(bodyHeight + 20)));
			await win.setSize({
				type: "Logical",
				width: 260,
				height: targetHeight,
				toJSON: (): { width: number; height: number } => {
					throw new Error("Function not implemented.");
				},
				__TAURI_TO_IPC_KEY__: (): { width: number; height: number } => {
					throw new Error("Function not implemented.");
				},
			});
		}
	} catch (_e) {
		// Non-Tauri environment
	}
}

if (isTauriAvailable() && typeof ResizeObserver !== "undefined") {
	const observer = new ResizeObserver(() => {
		void adjustMenuWindowSize();
	});
	observer.observe(document.body);
}
