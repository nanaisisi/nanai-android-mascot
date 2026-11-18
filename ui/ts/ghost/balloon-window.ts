/**
 * @file balloon-window.ts
 * @brief Nanai Android Mascot - 独立バルーンウィンドウ制御スクリプト
 */

import { emit, isTauriAvailable, listen } from "../core/tauri-helper.js";
import { setupWindowGestures } from "./balloon-window/gesture.js";
import { setupInteractiveElements } from "./balloon-window/interactive.js";
import { updateBalloonWindowScale } from "./balloon-window/scale.js";
import {
	applyBalloonDescript as applyThemeDescript,
	resizeBalloonWindowForScale,
} from "./balloon-window/theme.js";

const urlParams = new URLSearchParams(globalThis.location?.search || "");
const scopeId = parseInt(urlParams.get("scope") || "0", 10);
let appliedTheme: string | null = null;
let applyingTheme: string | null = null;
let currentDpiScale = 1;
let currentUserScale = 1;
let _isBalloonDontMove = false;

const ARROW_CLICK_SCROLL_STEP = 36;
const WHEEL_SCROLL_STEP = 28;
const boundScrollBoxes = new WeakSet<object>();
const boundScrollTexts = new WeakSet<object>();
const boundScrollArrows = new WeakSet<object>();

function findArrowElement(
	balloonBox: HTMLElement | null,
	selector: string,
	fallbackId: string,
): HTMLElement | null {
	const boxAny = balloonBox as unknown as {
		querySelector?: (s: string) => HTMLElement | null;
	} | null;
	if (typeof boxAny?.querySelector === "function") {
		const found = boxAny.querySelector(selector);
		if (found) return found;
	}
	if (typeof document !== "undefined") {
		if (typeof document.getElementById === "function") {
			const byId = document.getElementById(fallbackId);
			if (byId) return byId;
		}
		if (typeof document.querySelector === "function") {
			const bySel = document.querySelector(selector) as HTMLElement | null;
			if (bySel) return bySel;
		}
	}
	return null;
}

function readCssVar(el: HTMLElement | null, propName: string): string {
	if (!el?.style) return "";
	if (typeof el.style.getPropertyValue === "function") {
		return el.style.getPropertyValue(propName).trim();
	}
	return String(
		(el.style as unknown as Record<string, unknown>)[propName] || "",
	).trim();
}

function syncArrowImageFlag(
	arrowEl: HTMLElement | null,
	balloonBox: HTMLElement | null,
	cssVarName: string,
) {
	if (!arrowEl || typeof arrowEl.setAttribute !== "function") return;
	const root =
		typeof document !== "undefined" ? document.documentElement : null;
	let value =
		readCssVar(balloonBox, cssVarName) || readCssVar(root, cssVarName);
	if (!value && typeof globalThis.getComputedStyle === "function") {
		try {
			value = globalThis
				.getComputedStyle(arrowEl)
				.getPropertyValue(cssVarName)
				.trim();
		} catch (_e) {}
	}
	const hasImage = Boolean(value && value !== "none" && value.includes("url("));
	if (hasImage) {
		arrowEl.setAttribute("data-has-image", "true");
	} else if (typeof arrowEl.removeAttribute === "function") {
		arrowEl.removeAttribute("data-has-image");
	}
}

function setArrowVisible(arrowEl: HTMLElement | null, visible: boolean) {
	if (!arrowEl) return;
	if (visible) {
		if (typeof arrowEl.setAttribute === "function") {
			arrowEl.setAttribute("data-visible", "true");
		}
	} else if (typeof arrowEl.removeAttribute === "function") {
		arrowEl.removeAttribute("data-visible");
	}
}

function applyScrollDelta(balloonText: HTMLElement, delta: number) {
	const current =
		typeof balloonText.scrollTop === "number" ? balloonText.scrollTop : 0;
	let next = Math.max(0, current + delta);
	if (
		typeof balloonText.scrollHeight === "number" &&
		typeof balloonText.clientHeight === "number"
	) {
		const maxScroll = Math.max(
			0,
			balloonText.scrollHeight - balloonText.clientHeight,
		);
		next = Math.min(maxScroll, next);
	}
	balloonText.scrollTop = next;
}

export function updateBalloonScrollArrows(
	balloonBox: HTMLElement | null,
	balloonText: HTMLElement | null,
) {
	if (!balloonBox || !balloonText) return;
	const arrowUp = findArrowElement(
		balloonBox,
		".balloon-scroll-arrow-up",
		"balloon-arrow-up",
	);
	const arrowDown = findArrowElement(
		balloonBox,
		".balloon-scroll-arrow-down",
		"balloon-arrow-down",
	);

	syncArrowImageFlag(arrowUp, balloonBox, "--balloon-arrow0-image");
	syncArrowImageFlag(arrowDown, balloonBox, "--balloon-arrow1-image");

	if (
		typeof balloonText.scrollHeight !== "number" ||
		typeof balloonText.clientHeight !== "number"
	) {
		setArrowVisible(arrowUp, false);
		setArrowVisible(arrowDown, false);
		return;
	}

	const scrollTop =
		typeof balloonText.scrollTop === "number" ? balloonText.scrollTop : 0;
	const canScrollUp = scrollTop > 0;
	const canScrollDown =
		scrollTop + balloonText.clientHeight < balloonText.scrollHeight - 1;

	setArrowVisible(arrowUp, canScrollUp);
	setArrowVisible(arrowDown, canScrollDown);
}

export function setupBalloonScroll(
	balloonBox: HTMLElement | null,
	balloonText: HTMLElement | null,
) {
	if (!balloonBox || !balloonText) return;

	const onWheel = (e: Event) => {
		const we = e as WheelEvent;
		we?.preventDefault?.();
		we?.stopPropagation?.();
		const deltaY = typeof we?.deltaY === "number" ? we.deltaY : 0;
		if (deltaY === 0) return;
		applyScrollDelta(
			balloonText,
			deltaY > 0 ? WHEEL_SCROLL_STEP : -WHEEL_SCROLL_STEP,
		);
		updateBalloonScrollArrows(balloonBox, balloonText);
	};

	if (!boundScrollTexts.has(balloonText)) {
		boundScrollTexts.add(balloonText);
		balloonText.addEventListener("scroll", () => {
			updateBalloonScrollArrows(balloonBox, balloonText);
		});
		balloonText.addEventListener("wheel", onWheel, { passive: false });

		if (typeof MutationObserver === "function") {
			try {
				const textObserver = new MutationObserver(() => {
					updateBalloonScrollArrows(balloonBox, balloonText);
				});
				textObserver.observe(balloonText, {
					childList: true,
					characterData: true,
					subtree: true,
				});
			} catch (_e) {}
		}
	}

	if (!boundScrollBoxes.has(balloonBox)) {
		boundScrollBoxes.add(balloonBox);
		balloonBox.addEventListener("wheel", onWheel, { passive: false });

		if (typeof MutationObserver === "function") {
			try {
				const styleObserver = new MutationObserver(() => {
					updateBalloonScrollArrows(balloonBox, balloonText);
				});
				styleObserver.observe(balloonBox, {
					attributes: true,
					attributeFilter: ["style"],
				});
				if (typeof document !== "undefined" && document.documentElement) {
					styleObserver.observe(document.documentElement, {
						attributes: true,
						attributeFilter: ["style"],
					});
				}
			} catch (_e) {}
		}
	}

	const bindArrow = (arrowEl: HTMLElement | null, delta: number) => {
		if (!arrowEl || boundScrollArrows.has(arrowEl)) return;
		boundScrollArrows.add(arrowEl);
		const stop = (e: Event) => {
			e?.stopPropagation?.();
		};
		arrowEl.addEventListener("mousedown", stop);
		arrowEl.addEventListener("touchstart", stop, { passive: true });
		arrowEl.addEventListener("click", (e: Event) => {
			e?.stopPropagation?.();
			applyScrollDelta(balloonText, delta);
			updateBalloonScrollArrows(balloonBox, balloonText);
		});
	};

	const arrowUp = findArrowElement(
		balloonBox,
		".balloon-scroll-arrow-up",
		"balloon-arrow-up",
	);
	const arrowDown = findArrowElement(
		balloonBox,
		".balloon-scroll-arrow-down",
		"balloon-arrow-down",
	);
	bindArrow(arrowUp, -ARROW_CLICK_SCROLL_STEP);
	bindArrow(arrowDown, ARROW_CLICK_SCROLL_STEP);

	updateBalloonScrollArrows(balloonBox, balloonText);
}

export {
	setupInteractiveElements,
	setupWindowGestures,
	updateBalloonWindowScale,
};

export async function applyBalloonDescript(theme: string) {
	if (!isTauriAvailable()) return;
	if (appliedTheme === theme) return;
	if (applyingTheme === theme) return;
	applyingTheme = theme;
	try {
		const result = (await applyThemeDescript({
			theme,
			scopeId,
			currentUserScale,
			onDpiScaleChange: (newDpiScale: number) => {
				currentDpiScale = newDpiScale;
			},
			onDontMoveChange: (dontMove: boolean) => {
				_isBalloonDontMove = dontMove;
			},
		})) as { dpiScale?: number; isBalloonDontMove?: boolean } | null;
		if (result) {
			currentDpiScale = result.dpiScale ?? currentDpiScale;
			_isBalloonDontMove = result.isBalloonDontMove ?? _isBalloonDontMove;
			appliedTheme = theme;
			if (typeof document !== "undefined") {
				updateBalloonScrollArrows(
					document.getElementById("balloon-box"),
					document.getElementById("balloon-text"),
				);
			}
		}
	} catch (_e) {
	} finally {
		if (applyingTheme === theme) applyingTheme = null;
	}
}

export function initBalloonWindow() {
	const balloonBox = document.getElementById("balloon-box");
	const balloonText = document.getElementById("balloon-text");

	const savedTheme =
		urlParams.get("theme") ||
		localStorage.getItem("nanai_balloon_theme") ||
		"default";
	document.documentElement.setAttribute("data-balloon-theme", savedTheme);
	void applyBalloonDescript(savedTheme);

	setupBalloonScroll(balloonBox, balloonText);
	setupWindowGestures(balloonBox, {
		scopeId,
		getIsBalloonDontMove: () => _isBalloonDontMove,
		getUserScale: () => currentUserScale,
		getDpiScale: () => currentDpiScale,
		onUserScaleChange: (newScale: number) => {
			currentUserScale = newScale;
		},
	});

	if (!isTauriAvailable()) return;

	void listen(`update-balloon-content-${scopeId}`, (event: unknown) => {
		const ev = event as { payload?: { html?: string; theme?: string } };
		const { html, theme } = ev.payload || {};
		if (theme) {
			document.documentElement.setAttribute("data-balloon-theme", theme);
			void applyBalloonDescript(theme);
		}
		const targetText = document.getElementById("balloon-text");
		if (targetText && html !== undefined) {
			targetText.innerHTML = html;
			setupInteractiveElements(targetText, scopeId);
			targetText.scrollTop =
				typeof targetText.scrollHeight === "number"
					? targetText.scrollHeight
					: 0;
			updateBalloonScrollArrows(balloonBox, targetText);
		}
	});

	void listen("balloon-theme-changed", (event: unknown) => {
		const ev = event as { payload?: { theme?: string } | string };
		const payload = ev.payload;
		const theme =
			typeof payload === "object" && payload !== null
				? (payload as { theme?: string }).theme
				: payload;
		if (typeof theme === "string" && theme) {
			document.documentElement.setAttribute("data-balloon-theme", theme);
			localStorage.setItem("nanai_balloon_theme", theme);
			void applyBalloonDescript(theme);
		}
	});

	void listen("balloon-scale-changed", (event: unknown) => {
		const ev = event as {
			payload?: { userScale?: number; scale?: number } | number;
		};
		const payload = ev.payload;
		const scale =
			typeof payload === "object" && payload !== null
				? ((payload as { userScale?: number; scale?: number }).userScale ??
					(payload as { userScale?: number; scale?: number }).scale)
				: payload;
		if (typeof scale === "number" && !Number.isNaN(scale)) {
			currentUserScale = scale;
			if (balloonBox) {
				updateBalloonWindowScale(balloonBox, currentUserScale, currentDpiScale);
				resizeBalloonWindowForScale(
					balloonBox,
					scopeId,
					currentUserScale,
					currentDpiScale,
				);
			}
		}
	});

	void emit("balloon-ready", { scopeId });
}

if (typeof document !== "undefined") {
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", () => {
			initBalloonWindow();
		});
	} else {
		initBalloonWindow();
	}
}
