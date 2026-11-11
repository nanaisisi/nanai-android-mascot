/**
 * @file balloon-window.ts
 * @brief Nanai Android Mascot - 独立バルーンウィンドウ制御スクリプト
 */

import { emit, isTauriAvailable, listen } from "../core/tauri-helper.js";
import { setupWindowGestures } from "./balloon-window/gesture.js";
import { setupInteractiveElements } from "./balloon-window/interactive.js";
import { updateBalloonWindowScale } from "./balloon-window/scale.js";
import { applyBalloonDescript as applyThemeDescript } from "./balloon-window/theme.js";

const urlParams = new URLSearchParams(globalThis.location?.search || "");
const scopeId = parseInt(urlParams.get("scope") || "0", 10);
let appliedTheme: string | null = null;
let applyingTheme: string | null = null;
let currentDpiScale = 1;
let currentUserScale = 1;
let _isBalloonDontMove = false;

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
		}
	} catch (_e) {
	} finally {
		if (applyingTheme === theme) applyingTheme = null;
	}
}

export function initBalloonWindow() {
	const balloonBox = document.getElementById("balloon-box");
	const _balloonText = document.getElementById("balloon-text");

	const savedTheme =
		urlParams.get("theme") ||
		localStorage.getItem("nanai_balloon_theme") ||
		"default";
	document.documentElement.setAttribute("data-balloon-theme", savedTheme);
	void applyBalloonDescript(savedTheme);

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
			if (balloonBox) {
				balloonBox.scrollTop = balloonBox.scrollHeight;
			}
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
