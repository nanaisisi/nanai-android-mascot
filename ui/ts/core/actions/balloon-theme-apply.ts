// @ts-nocheck
import { emit, invoke, isTauriAvailable } from "../tauri-helper.js";
import {
	BALLOON_SCALE_MAP,
	MAX_BALLOON_SCALE,
	MIN_BALLOON_SCALE,
} from "./balloon-theme-constants.js";

export interface BalloonThemeManagerInterface {
	userScale: number;
	dpiScale?: number;
	currentTheme?: string;
	app?: {
		balloonUserScale?: number;
		balloonDpiScale?: number;
		currentBalloonTheme?: string;
		ghostController?: {
			sendBalloonScalingNotify?: (
				afterX: number,
				beforeX: number,
				afterY: number,
				beforeY: number,
			) => Promise<unknown>;
			sendShioriEvent?: (event: string, args?: string[]) => Promise<unknown>;
			[key: string]: unknown;
		};
		showBalloon?: (message: string) => unknown;
		hideBalloon?: () => unknown;
		elements?: {
			balloonDisplay?: HTMLElement | null;
			[key: string]: HTMLElement | null | undefined;
		};
		applyBalloonDescript?: (props: unknown) => unknown;
		[key: string]: unknown;
	};
	clearNineSliceCache: () => void;
	resetDescript: () => void;
	[key: string]: unknown;
}

export function applyBalloonScale(
	manager: BalloonThemeManagerInterface,
	actionOrScale: string | number,
) {
	const prevScale = manager.userScale || 1;
	const prevPercent = Math.round(prevScale * 100);

	let rawScale = 1;
	if (typeof actionOrScale === "number") {
		rawScale = actionOrScale;
	} else if (BALLOON_SCALE_MAP[actionOrScale]) {
		rawScale = parseFloat(BALLOON_SCALE_MAP[actionOrScale]) || 1;
	} else {
		rawScale = parseFloat(actionOrScale) || 1;
	}

	if (Number.isNaN(rawScale) || !Number.isFinite(rawScale)) {
		rawScale = 1;
	}

	// 境界値安全クランプ [0.1, 5.0]
	const scale = Math.max(
		MIN_BALLOON_SCALE,
		Math.min(MAX_BALLOON_SCALE, rawScale),
	);

	manager.userScale = scale;
	if (manager.app) {
		manager.app.balloonUserScale = scale;
	}
	const dpiScale = manager.dpiScale || manager.app?.balloonDpiScale || 1;
	const finalScale = +(scale * dpiScale).toFixed(4);
	const percent = Math.round(scale * 100);

	if (typeof document !== "undefined") {
		const root = document.documentElement;
		if (root) {
			root.style.setProperty("--balloon-user-scale", String(scale));
		}
		const balloonEl = document.querySelector(".balloon") as HTMLElement | null;
		if (balloonEl?.style) {
			balloonEl.style.transform = `scale(${finalScale})`;
			balloonEl.style.transformOrigin = "top left";
		}
	}

	if (isTauriAvailable()) {
		emit("balloon-scale-changed", {
			userScale: scale,
			dpiScale,
			finalScale,
		});
	}

	// UKADOC準拠: OnBalloonScaling SHIORIイベント送信
	if (percent !== prevPercent) {
		const gc = manager.app?.ghostController;
		if (gc?.sendBalloonScalingNotify) {
			void gc.sendBalloonScalingNotify(
				percent,
				prevPercent,
				percent,
				prevPercent,
			);
		} else if (gc?.sendShioriEvent) {
			void gc.sendShioriEvent("OnBalloonScaling", [
				String(percent),
				String(prevPercent),
				String(percent),
				String(prevPercent),
			]);
		}
	}

	if (manager.app?.showBalloon) {
		manager.app.showBalloon(`バルーン倍率を ${percent}% に変更しました`);
		setTimeout(() => manager.app?.hideBalloon?.(), 1500);
	}
	return { scale, finalScale, percent };
}

export async function setBalloonThemeImpl(
	manager: BalloonThemeManagerInterface,
	themeName: string | undefined,
) {
	if (!themeName || themeName === manager.currentTheme) {
		return;
	}
	manager.currentTheme = themeName;
	if (manager.app) {
		manager.app.currentBalloonTheme = themeName;
	}
	try {
		if (typeof localStorage !== "undefined") {
			localStorage.setItem("nanai_balloon_theme", themeName);
		}
	} catch (_) {
		// localStorage unavailable
	}

	if (typeof document !== "undefined") {
		const root = document.documentElement;
		if (root) {
			root.setAttribute("data-balloon-theme", themeName);
		}
		if (document.body) {
			document.body.className = `balloon-theme-${themeName}`;
		}
	}
	manager.app?.elements?.balloonDisplay?.setAttribute(
		"data-balloon-theme",
		themeName,
	);

	if (isTauriAvailable()) {
		emit("sync-theme", themeName);
		if (themeName === "nam_default_plus_overhead") {
			void invoke("set_balloon_offset", {
				scopeId: 0,
				x: -40,
				y: -210,
			}).catch(() => {});
			void invoke("set_balloon_offset", {
				scopeId: 1,
				x: -40,
				y: -210,
			}).catch(() => {});
		} else if (themeName === "nam_default_plus") {
			void invoke("reset_balloon_positions").catch(() => {});
		}
	}

	manager.clearNineSliceCache();
	manager.resetDescript();
	if (isTauriAvailable()) {
		try {
			const props = await invoke("balloon_manifest", { name: themeName });
			if (props && typeof props === "object") {
				manager.app?.applyBalloonDescript?.(props);
			}
		} catch (_e) {
			// スキン descript 未定義の場合は無視
		}
	}
}
