import {
	getOverlayWindowOrigin,
	invoke,
	isNativeMultiWindow,
	isTauriAvailable,
} from "../core/tauri-helper.js";
import { InlineSubmenuController } from "./context-menu-inline-submenu.js";
import { handleMenuKeydown } from "./context-menu-keyboard.js";
import { setupContextMenuSync } from "./context-menu-sync.js";
import { MenuDispatcher } from "./menu-dispatcher.js";
import { MenuSubmenuRenderer } from "./menu-submenu-renderer.js";

export { handleMenuKeydown, MENU_KEY_MAP } from "./context-menu-keyboard.js";
export { setupContextMenuSync } from "./context-menu-sync.js";

const dispatcher = new MenuDispatcher();
const renderer = new MenuSubmenuRenderer(dispatcher);
const inlineSubmenu = new InlineSubmenuController(dispatcher);

function syncInlineSubmenuModeClass() {
	const isEmbeddedIframe = Boolean(
		globalThis.parent && (globalThis.parent as unknown) !== globalThis,
	);
	if (isNativeMultiWindow() && !isEmbeddedIframe) {
		document.body?.classList?.remove?.("inline-submenu-mode");
	} else {
		document.body?.classList?.add?.("inline-submenu-mode");
	}
}
syncInlineSubmenuModeClass();

/**
 * [Design Invariant / 設計仕様]
 * コンテキストメニューウィンドウは固定ポップアップとして表示されるため、
 * キャラクターやバルーンウィンドウとは異なり、ドラッグ移動不可（非ドラッグ）仕様です。
 * 誤ってウィンドウドラッグ機能（startDraggingWindow）を追加しないよう注意してください。
 */

const BLUR_GRACE_MS = 350;
const BLUR_DEBOUNCE_MS = 80;

let hasActiveSubmenu = false;
let activeSubmenuType: string | null = null;
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
	activeSubmenuType = null;
	menuOpenedAt = Date.now();
	clearBlurCloseTimer();
	inlineSubmenu.close(false);
	scheduleMenuWindowResize(true);
}

// Tauri / iframe 同期リスナー初期化
setupContextMenuSync(
	dispatcher,
	renderer,
	resetMenuFocusState,
	() => {
		scheduleMenuWindowResize(false);
	},
	(patch) => {
		inlineSubmenu.updateData(patch);
	},
);

// 独立サブメニューウィンドウ（デスクトップ）またはインラインサブメニュー（モバイル/Android/Web）を開く補助関数
function _triggerSubmenuWindow(
	menuType: string,
	buttonEl: Element,
	fromHover = false,
) {
	if (fromHover && hasActiveSubmenu && activeSubmenuType === menuType) {
		return;
	}
	const now = Date.now();
	if (
		lastSubmenuRequest?.type === menuType &&
		now - lastSubmenuRequest.time < 180
	) {
		return;
	}
	lastSubmenuRequest = { type: menuType, time: now };

	hasActiveSubmenu = true;
	activeSubmenuType = menuType;
	const wrapper = buttonEl.closest(".menu-item-wrapper");

	if (isNativeMultiWindow()) {
		const rect = buttonEl.getBoundingClientRect();
		const { x: sX, y: sY } = getOverlayWindowOrigin();
		const containerRect = document
			.querySelector(".menu-container")
			?.getBoundingClientRect();
		const menuWidth =
			containerRect && containerRect.right > 0
				? Math.ceil(containerRect.right)
				: globalThis.innerWidth || 260;
		const posX = sX + menuWidth + 2;
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

export function getMenuTypeFromButton(btn: Element): string {
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
	if (type === "ghost-history") {
		type = "recent";
	}
	return type;
}

document.addEventListener("click", (e) => {
	const target = e.target as Element | null;
	if (target?.closest?.("#inline-submenu-panel")) {
		return;
	}

	const menuItem = target?.closest?.(".menu-item");
	if (!menuItem) {
		if (
			inlineSubmenu.isOpen() &&
			!target?.closest?.(
				".menu-container, .menu-sidebar, #inline-submenu-panel",
			)
		) {
			inlineSubmenu.close(false);
			hasActiveSubmenu = false;
			activeSubmenuType = null;
		}
		return;
	}

	// サブメニュー展開用の親ボタン
	if (menuItem.classList.contains("has-submenu")) {
		const menuType = getMenuTypeFromButton(menuItem);
		if (isNativeMultiWindow()) {
			_triggerSubmenuWindow(menuType, menuItem);
			return;
		}

		const wrapper = menuItem.closest(".menu-item-wrapper");
		if (wrapper?.classList?.contains?.("menu-item-wrapper")) {
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
			return;
		}

		const opened = inlineSubmenu.toggle(menuType, menuItem);
		hasActiveSubmenu = opened;
		activeSubmenuType = opened ? menuType : null;
		return;
	}

	if (inlineSubmenu.isOpen()) {
		inlineSubmenu.close(false);
		hasActiveSubmenu = false;
		activeSubmenuType = null;
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
	if (!isNativeMultiWindow()) {
		return;
	}
	const item = (e.target as Element | null)?.closest?.(".menu-item");
	if (!item) return;
	if (!item.classList.contains("has-submenu")) {
		if (hasActiveSubmenu) {
			hasActiveSubmenu = false;
			activeSubmenuType = null;
			void invoke("hide_submenu_window").catch(() => {});
			globalThis.window?.focus?.();
		}
		return;
	}
	const wrapper = item.closest(".menu-item-wrapper") || item.parentElement;
	if (wrapper) {
		checkSubmenuFlip(wrapper);
	}
	const menuType = getMenuTypeFromButton(item);
	_triggerSubmenuWindow(menuType, item, true);
});

document.querySelectorAll(".menu-item-wrapper").forEach((wrapper) => {
	wrapper.addEventListener("mouseenter", () => {
		checkSubmenuFlip(wrapper);
		if (isNativeMultiWindow()) {
			const btn = wrapper.querySelector(".menu-item.has-submenu");
			if (btn) {
				const menuType = getMenuTypeFromButton(btn);
				_triggerSubmenuWindow(menuType, btn, true);
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
	syncInlineSubmenuModeClass();
	try {
		const savedTheme = localStorage.getItem("nanai_balloon_theme");
		if (savedTheme) {
			renderer.applyTheme(savedTheme);
		}
	} catch (_err) {
		// LocalStorage access restricted or unavailable
	}
	dispatcher.dispatchAction("request-sync");
	scheduleMenuWindowResize(true);
});

// ショートカットキー対応 (T, B, R, P, O, D, A, C, Ctrl+I, Ctrl+W, Escape)
document.addEventListener("keydown", (e) => {
	if (
		inlineSubmenu.isOpen() &&
		(e.key === "Escape" || e.key === "ArrowLeft" || e.key === "Backspace")
	) {
		e.preventDefault?.();
		e.stopPropagation?.();
		inlineSubmenu.close(true);
		hasActiveSubmenu = false;
		activeSubmenuType = null;
		return;
	}
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

let lastWindowWidth: number | null = null;
let lastWindowHeight: number | null = null;

export function computeMenuWindowSize(): {
	width: number;
	height: number;
} | null {
	const sidebar = document.querySelector(".menu-sidebar");
	const container = document.querySelector(".menu-container");
	const sidebarRect = sidebar?.getBoundingClientRect?.();
	const containerRect = container?.getBoundingClientRect?.();

	let measuredWidth = 0;
	if (containerRect && containerRect.width > 0) {
		const sidebarWidth =
			sidebarRect && sidebarRect.width > 0 ? sidebarRect.width : 0;
		measuredWidth = Math.ceil(sidebarWidth + containerRect.width);
	} else {
		const bodyWidth =
			document.body?.getBoundingClientRect?.().width ||
			document.body?.scrollWidth ||
			document.documentElement?.scrollWidth ||
			0;
		measuredWidth = Math.ceil(bodyWidth);
	}

	const rawHeight =
		containerRect && containerRect.height > 0
			? containerRect.height
			: document.body?.scrollHeight ||
				document.documentElement?.scrollHeight ||
				0;

	if (rawHeight <= 50) {
		return null;
	}

	const width = Math.min(380, Math.max(150, measuredWidth || 220));
	const height = Math.min(650, Math.max(100, Math.ceil(rawHeight)));
	return { width, height };
}

export async function adjustMenuWindowSize(force = false) {
	if (!isTauriAvailable() || !isNativeMultiWindow()) return;
	const size = computeMenuWindowSize();
	if (!size) return;
	if (
		!force &&
		lastWindowWidth === size.width &&
		lastWindowHeight === size.height
	) {
		return;
	}
	try {
		await invoke("resize_menu_window", {
			width: size.width,
			height: size.height,
		});
		lastWindowWidth = size.width;
		lastWindowHeight = size.height;
	} catch (e) {
		console.warn("Failed to resize menu window:", e);
	}
}

export function scheduleMenuWindowResize(force = false) {
	if (typeof requestAnimationFrame === "function") {
		requestAnimationFrame(() => {
			void adjustMenuWindowSize(force);
		});
	} else {
		void adjustMenuWindowSize(force);
	}
}

if (isTauriAvailable() && typeof ResizeObserver !== "undefined") {
	const observer = new ResizeObserver(() => {
		scheduleMenuWindowResize(false);
	});
	observer.observe(document.body);
}
