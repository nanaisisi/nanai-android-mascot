/**
 * @file balloon-window.ts
 * @brief Nanai Android Mascot - 独立バルーンウィンドウ制御スクリプト
 */

import {
	emit,
	invoke,
	isTauriAvailable,
	listen,
} from "../core/tauri-helper.js";
import { setupWindowGestures } from "./balloon-window/gesture.js";
import { setupInteractiveElements } from "./balloon-window/interactive.js";
import { updateBalloonWindowScale } from "./balloon-window/scale.js";
import {
	applyBalloonDescript as applyThemeDescript,
	resizeBalloonWindowForScale,
} from "./balloon-window/theme.js";

type BalloonSide = "left" | "right" | "top" | "auto";

const urlParams = new URLSearchParams(globalThis.location?.search || "");
const scopeId = parseInt(urlParams.get("scope") || "0", 10);
let appliedTheme: string | null = null;
let appliedBalloonId: number | null = null;
let currentBalloonId: number | null = null;
let appliedSide: BalloonSide = "auto";
let currentSide: BalloonSide = "auto";
let applyingKey: string | null = null;
let currentDpiScale = 1;
let currentUserScale = 1;
let _isBalloonDontMove = false;

function isValidBalloonSide(side: unknown): side is BalloonSide {
	return (
		side === "left" || side === "right" || side === "top" || side === "auto"
	);
}

function resolveActiveTheme(theme?: unknown): string {
	if (typeof theme === "string" && theme) return theme;
	if (appliedTheme) return appliedTheme;
	if (typeof document !== "undefined") {
		const attrTheme =
			document.documentElement.getAttribute("data-balloon-theme");
		if (attrTheme) return attrTheme;
	}
	const paramTheme = urlParams.get("theme");
	if (paramTheme) return paramTheme;
	try {
		const saved = localStorage.getItem("nanai_balloon_theme");
		if (saved) return saved;
	} catch (_e) {}
	return "default";
}

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

function isBalloonHtmlBlank(html: string): boolean {
	const raw = String(html ?? "");
	if (/<(?:button|a|img|input|textarea|select)\b/i.test(raw)) {
		return false;
	}
	const stripped = raw
		.replace(/<[^>]*>/g, "")
		.replace(/&nbsp;|\u00a0/gi, " ")
		.trim();
	return stripped.length === 0;
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

let registeredShortcutHandler: ((e: KeyboardEvent) => void) | null = null;

/**
 * バルーンウィンドウ内のキーボードショートカット処理 (`Ctrl+Shift+F10` でバルーン位置初期化)
 */
export function handleBalloonWindowKeydown(e: KeyboardEvent): boolean {
	const key = typeof e?.key === "string" ? e.key.toLowerCase() : "";
	if (
		e?.ctrlKey &&
		e?.shiftKey &&
		!e?.altKey &&
		!e?.metaKey &&
		!e?.repeat &&
		key === "f10"
	) {
		e.preventDefault?.();
		if (isTauriAvailable()) {
			void invoke("reset_balloon_positions").catch(() => {});
		}
		return true;
	}
	return false;
}

export async function applyBalloonDescript(
	theme: string,
	balloonId: number | null = currentBalloonId,
	side: BalloonSide = currentSide,
) {
	if (!isTauriAvailable()) return;
	const stateKey = `${theme}::${balloonId ?? "default"}::${side}`;
	if (
		appliedTheme === theme &&
		appliedBalloonId === balloonId &&
		appliedSide === side
	) {
		return;
	}
	if (applyingKey === stateKey) return;
	applyingKey = stateKey;
	try {
		const result = (await applyThemeDescript({
			theme,
			scopeId,
			balloonId,
			side,
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
			appliedBalloonId = balloonId;
			appliedSide = side;
			if (typeof document !== "undefined") {
				updateBalloonScrollArrows(
					document.getElementById("balloon-box"),
					document.getElementById("balloon-text"),
				);
			}
		}
	} catch (_e) {
	} finally {
		if (applyingKey === stateKey) applyingKey = null;
	}
}

export function initBalloonWindow() {
	appliedTheme = null;
	appliedBalloonId = null;
	appliedSide = "auto";
	currentBalloonId = null;
	currentSide = "auto";
	applyingKey = null;

	const balloonBox = document.getElementById("balloon-box");
	const balloonText = document.getElementById("balloon-text");

	const savedTheme =
		urlParams.get("theme") ||
		localStorage.getItem("nanai_balloon_theme") ||
		"default";
	document.documentElement.setAttribute("data-balloon-theme", savedTheme);
	void applyBalloonDescript(savedTheme, currentBalloonId, currentSide);

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

	if (
		typeof document !== "undefined" &&
		typeof document.addEventListener === "function"
	) {
		if (
			registeredShortcutHandler &&
			typeof document.removeEventListener === "function"
		) {
			document.removeEventListener("keydown", registeredShortcutHandler);
		}
		registeredShortcutHandler = (e: KeyboardEvent) => {
			handleBalloonWindowKeydown(e);
		};
		document.addEventListener("keydown", registeredShortcutHandler);
	}

	if (!isTauriAvailable()) return;

	void listen(`update-balloon-content-${scopeId}`, (event: unknown) => {
		const ev = event as {
			payload?: {
				html?: string;
				theme?: string;
				balloonId?: number | null;
				side?: BalloonSide;
			};
		};
		const { html, theme, balloonId, side } = ev.payload || {};
		const hasTheme = typeof theme === "string" && theme.length > 0;
		const hasBalloonId = typeof balloonId === "number" || balloonId === null;
		const hasSide = isValidBalloonSide(side);
		if (hasBalloonId) {
			currentBalloonId = balloonId;
		}
		if (hasSide) {
			currentSide = side;
		}
		if (hasTheme) {
			document.documentElement.setAttribute("data-balloon-theme", theme);
		}
		if (hasTheme || hasBalloonId || hasSide) {
			void applyBalloonDescript(
				resolveActiveTheme(theme),
				currentBalloonId,
				currentSide,
			);
		}
		const targetText = document.getElementById("balloon-text");
		if (targetText && html !== undefined) {
			if (isBalloonHtmlBlank(html)) {
				targetText.innerHTML = "";
				targetText.scrollTop = 0;
				if (balloonBox?.style) {
					balloonBox.style.display = "none";
				}
				updateBalloonScrollArrows(balloonBox, targetText);
				findArrowElement(
					balloonBox,
					".balloon-scroll-arrow-up",
					"balloon-arrow-up",
				)?.removeAttribute?.("data-visible");
				findArrowElement(
					balloonBox,
					".balloon-scroll-arrow-down",
					"balloon-arrow-down",
				)?.removeAttribute?.("data-visible");
				void invoke("hide_balloon_window", {
					params: { scope_id: scopeId },
					scope_id: scopeId,
					scopeId,
				}).catch(() => {});
			} else {
				if (balloonBox?.style && balloonBox.style.display === "none") {
					balloonBox.style.display = "";
				}
				targetText.innerHTML = html;
				setupInteractiveElements(targetText, scopeId);
				targetText.scrollTop =
					typeof targetText.scrollHeight === "number"
						? targetText.scrollHeight
						: 0;
				updateBalloonScrollArrows(balloonBox, targetText);
			}
		}
	});

	void listen("balloon-state-changed", (event: unknown) => {
		const ev = event as {
			payload?: {
				scopeId?: number;
				theme?: string;
				balloonId?: number | null;
				side?: BalloonSide;
			};
		};
		const payload = ev.payload;
		if (!payload) return;
		if (payload.scopeId !== undefined && payload.scopeId !== scopeId) return;
		if (typeof payload.balloonId === "number" || payload.balloonId === null) {
			currentBalloonId = payload.balloonId;
		}
		if (isValidBalloonSide(payload.side)) {
			currentSide = payload.side;
		}
		if (typeof payload.theme === "string" && payload.theme) {
			document.documentElement.setAttribute(
				"data-balloon-theme",
				payload.theme,
			);
		}
		void applyBalloonDescript(
			resolveActiveTheme(payload.theme),
			currentBalloonId,
			currentSide,
		);
	});

	void listen("balloon-theme-changed", (event: unknown) => {
		const ev = event as {
			payload?:
				| { theme?: string; balloonId?: number | null; side?: BalloonSide }
				| string;
		};
		const payload = ev.payload;
		const theme =
			typeof payload === "object" && payload !== null
				? (payload as { theme?: string }).theme
				: payload;
		if (typeof payload === "object" && payload !== null) {
			const obj = payload as {
				balloonId?: number | null;
				side?: BalloonSide;
			};
			if (typeof obj.balloonId === "number" || obj.balloonId === null) {
				currentBalloonId = obj.balloonId;
			}
			if (isValidBalloonSide(obj.side)) {
				currentSide = obj.side;
			}
		}
		if (typeof theme === "string" && theme) {
			document.documentElement.setAttribute("data-balloon-theme", theme);
			localStorage.setItem("nanai_balloon_theme", theme);
			void applyBalloonDescript(theme, currentBalloonId, currentSide);
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
