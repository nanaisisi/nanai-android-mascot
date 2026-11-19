import {
	invoke,
	isNativeMultiWindow,
	isTauriAvailable,
} from "../core/tauri-helper.js";
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

const BLUR_GRACE_MS = 350;
const BLUR_DEBOUNCE_MS = 80;

let hasActiveSubmenu = false;
let menuOpenedAt = Date.now();
let blurCloseTimer: ReturnType<typeof setTimeout> | null = null;
let lastSubmenuRequest: { type: string; time: number } | null = null;

function clearBlurCloseTimer() {
	if (blurCloseTimer !== null) {
		clearTimeout(blurCloseTimer);
		blurCloseTimer = null;
	}
}

export function resetMenuFocusState() {
	hasActiveSubmenu = false;
	menuOpenedAt = Date.now();
	clearBlurCloseTimer();
}

// Tauri / iframe 同期リスナー初期化
setupContextMenuSync(dispatcher, renderer, resetMenuFocusState);

// 独立サブメニューウィンドウ（デスクトップ）またはインラインサブメニュー（モバイル/Android/Web）を開く補助関数
function _triggerSubmenuWindow(menuType: string, buttonEl: Element) {
	const now = Date.now();
	if (
		lastSubmenuRequest?.type === menuType &&
		now - lastSubmenuRequest.time < 180
	) {
		return;
	}
	lastSubmenuRequest = { type: menuType, time: now };

	hasActiveSubmenu = true;
	const wrapper = buttonEl.closest(".menu-item-wrapper");

	if (isNativeMultiWindow()) {
		const rect = buttonEl.getBoundingClientRect();
		const sX = globalThis.screenX ?? 0;
		const sY = globalThis.screenY ?? 0;
		const posX = sX + 260 + 2;
		const posY = sY + rect.top;
		const winHeight =
			menuType === "utility" ||
			menuType === "utility-root" ||
			menuType === "tools"
				? 460
				: 320;
		invoke("show_submenu_window", {
			params: {
				menuType: menuType,
				x: posX,
				y: posY,
				width: 240,
				height: winHeight,
			},
		}).catch((e) => {
			console.error("Failed to show submenu window:", e);
			if (wrapper) {
				checkSubmenuFlip(wrapper);
				wrapper.classList.add("open");
			}
		});
	} else if (wrapper) {
		const isAlreadyOpen = wrapper.classList.contains("open");
		document.querySelectorAll(".menu-item-wrapper.open").forEach((el) => {
			if (el !== wrapper) el.classList.remove("open");
		});
		if (!isAlreadyOpen) {
			checkSubmenuFlip(wrapper);
			wrapper.classList.add("open");
		} else {
			wrapper.classList.remove("open");
		}
	}
}

function getMenuTypeFromButton(btn: Element): string {
	let type = btn.id
		.replace("-menu-btn", "")
		.replace("-switch-btn", "")
		.replace("-btn", "");
	if (type === "config") {
		type = "settings";
	}
	if (type === "utility-root" || type === "tools") {
		type = "utility";
	}
	return type;
}

document.addEventListener("click", (e) => {
	const menuItem = (e.target as Element).closest(".menu-item");
	if (!menuItem) return;

	// サブメニュー展開用の親ボタン
	if (menuItem.classList.contains("has-submenu")) {
		const menuType = getMenuTypeFromButton(menuItem);
		if (isNativeMultiWindow()) {
			_triggerSubmenuWindow(menuType, menuItem);
			return;
		}

		const wrapper = menuItem.closest(".menu-item-wrapper");
		if (wrapper) {
			const isAlreadyOpen = wrapper.classList.contains("open");
			document.querySelectorAll(".menu-item-wrapper.open").forEach((el) => {
				if (el !== wrapper) el.classList.remove("open");
			});
			if (!isAlreadyOpen) {
				checkSubmenuFlip(wrapper);
				wrapper.classList.add("open");
			} else {
				wrapper.classList.remove("open");
			}
		}
		return;
	}

	const action =
		(menuItem as HTMLElement).dataset?.action ||
		menuItem.id.replace("-btn", "");
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

// ホバー時にも右/左展開を判定 & サブメニュー呼び出し
document.addEventListener("mouseover", (e: MouseEvent) => {
	const item = (e.target as Element | null)?.closest?.(".menu-item");
	if (!item) return;
	if (!item.classList.contains("has-submenu")) {
		if (hasActiveSubmenu) {
			hasActiveSubmenu = false;
			if (isNativeMultiWindow()) {
				void invoke("hide_submenu_window").catch(() => {});
				globalThis.window?.focus?.();
			} else {
				document.querySelectorAll(".menu-item-wrapper.open").forEach((el) => {
					el.classList.remove("open");
				});
			}
		}
		return;
	}
	const wrapper = item.closest(".menu-item-wrapper") || item.parentElement;
	if (wrapper) {
		checkSubmenuFlip(wrapper);
	}
	const menuType = getMenuTypeFromButton(item);
	if (isNativeMultiWindow()) {
		_triggerSubmenuWindow(menuType, item);
	} else if (wrapper) {
		document.querySelectorAll(".menu-item-wrapper.open").forEach((el) => {
			if (el !== wrapper) el.classList.remove("open");
		});
		if (!wrapper.classList.contains("open")) {
			wrapper.classList.add("open");
		}
	}
});

document.querySelectorAll(".menu-item-wrapper").forEach((wrapper) => {
	wrapper.addEventListener("mouseenter", () => {
		checkSubmenuFlip(wrapper);
		if (isNativeMultiWindow()) {
			const btn = wrapper.querySelector(".menu-item.has-submenu");
			if (btn) {
				const menuType = getMenuTypeFromButton(btn);
				_triggerSubmenuWindow(menuType, btn);
			}
		} else {
			if (!wrapper.classList.contains("open")) {
				wrapper.classList.add("open");
			}
		}
	});
	wrapper.addEventListener("mouseleave", () => {
		if (!isNativeMultiWindow()) {
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

globalThis.addEventListener("focus", () => {
	clearBlurCloseTimer();
});

// メニューからフォーカスが外れた（blur）際、過渡的blurを除外して自然にメニューウィンドウを閉じる
globalThis.addEventListener("blur", () => {
	if (hasActiveSubmenu) return;
	if (!isTauriAvailable()) {
		void dispatcher.dispatchAction("close-menu");
		return;
	}
	if (Date.now() - menuOpenedAt < BLUR_GRACE_MS) {
		return;
	}
	clearBlurCloseTimer();
	blurCloseTimer = setTimeout(() => {
		blurCloseTimer = null;
		if (hasActiveSubmenu || Date.now() - menuOpenedAt < BLUR_GRACE_MS) {
			return;
		}
		const hasDocFocus =
			typeof document.hasFocus === "function" ? document.hasFocus() : false;
		if (!hasDocFocus) {
			void dispatcher.dispatchAction("close-menu");
		}
	}, BLUR_DEBOUNCE_MS);
});

async function adjustMenuWindowSize() {
	if (!isTauriAvailable()) return;
	try {
		const modName = "@tauri-apps/api/window";
		const { getCurrentWindow } = await import(/* @vite-ignore */ modName);
		const dpiModName = "@tauri-apps/api/dpi";
		const { LogicalSize } = await import(/* @vite-ignore */ dpiModName);
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
			const targetHeight = Math.min(
				650,
				Math.max(140, Math.ceil(bodyHeight + 20)),
			);
			await win.setSize(new LogicalSize(260, targetHeight));
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
