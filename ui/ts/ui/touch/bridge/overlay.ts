/**
 * @file overlay.js
 * @description Slot-12 Android プラットフォーム判別 & オーバーレイ・フォアグラウンドサービス制御
 * Contract: OverlayManager, isAndroidPlatform, isNativeAndroidPlatform
 */

import {
	invoke,
	isAndroidMobile,
	isTauriAvailable,
} from "../../../core/tauri-helper.js";
import { ANDROID_EVENTS } from "./constants.js";
import {
	computeUnifiedLayout,
	type UnifiedLayoutInput,
} from "./unified-layout.js";

/**
 * Android環境かどうかを判定 (Windows環境下では絶対false)
 * @returns {boolean}
 */
export function isAndroidPlatform(): boolean {
	if (
		typeof globalThis.location !== "undefined" &&
		globalThis.location?.search
	) {
		const search = globalThis.location.search;
		const params = new URLSearchParams(search);
		const plat = params.get("platform") || params.get("mode");
		if (plat) {
			const lower = plat.toLowerCase();
			if (lower === "android" || lower === "mobile") return true;
			if (lower === "desktop" || lower === "windows") return false;
		}
	}
	return isAndroidMobile();
}

/**
 * Tauriネイティブ環境かつAndroidであるか判定
 * @returns {boolean}
 */
export function isNativeAndroidPlatform() {
	return isTauriAvailable() && isAndroidPlatform();
}

export type OverlayInvokeHandler = (
	cmd: string,
	args?: Record<string, unknown>,
) => Promise<unknown>;

export interface OverlayManagerOptions {
	invokeHandler?: OverlayInvokeHandler;
	dispatchFn?: (eventName: string, data: unknown) => void;
}

/**
 * オーバーレイおよびプラットフォームIPC機能を管理するクラス
 */
export class OverlayManager {
	_invoke: OverlayInvokeHandler;
	_dispatch: (eventName: string, data: unknown) => void;
	_isForegroundServiceActive: boolean;
	_isOverlayEnabled: boolean;
	_overlayTransparency: number;
	_isClickThrough: boolean;
	_isUnified = false;
	/**
	 * @param {OverlayManagerOptions} [options={}]
	 */
	constructor(options: OverlayManagerOptions = {}) {
		this._invoke = options.invokeHandler || invoke;
		this._dispatch =
			typeof options.dispatchFn === "function" ? options.dispatchFn : () => {};
		this._isForegroundServiceActive = false;
		this._isOverlayEnabled = false;
		this._overlayTransparency = 1.0;
		this._isClickThrough = false;
	}

	/**
	 * フォアグラウンドサービスが有効か
	 * @returns {boolean}
	 */
	get isForegroundServiceActive() {
		return this._isForegroundServiceActive;
	}

	/**
	 * オーバーレイが有効か
	 * @returns {boolean}
	 */
	get isOverlayEnabled() {
		return this._isOverlayEnabled;
	}

	/**
	 * オーバーレイ透明度 (0.0 - 1.0)
	 * @returns {number}
	 */
	get overlayTransparency() {
		return this._overlayTransparency;
	}

	/**
	 * クリックスルー状態
	 * @returns {boolean}
	 */
	get isClickThrough() {
		return this._isClickThrough;
	}

	/**
	 * 全キャラ単一ウインドウ表示が有効か
	 * @returns {boolean}
	 */
	get isUnified() {
		return this._isUnified;
	}

	/**
	 * 単一ウインドウ統合表示の切り替え
	 * @param {boolean} enabled
	 * @returns {boolean}
	 */
	setUnified(enabled: boolean) {
		this._isUnified = Boolean(enabled);
		this._dispatch(ANDROID_EVENTS.OVERLAY_UNIFIED_CHANGED, {
			enabled: this._isUnified,
		});
		return this._isUnified;
	}

	/**
	 * 統合レイアウトを計算し、単一ウインドウのサイズを適用する。無効時は null。
	 */
	async applyUnifiedLayout(characters: UnifiedLayoutInput[], gap?: number) {
		if (!this._isUnified) return null;
		const layout = computeUnifiedLayout(characters, gap);
		if (layout.width > 0 && isTauriAvailable()) {
			try {
				await this._invoke("resize_overlay_window", {
					width: layout.width,
					height: layout.height,
				});
			} catch (err) {
				console.warn("applyUnifiedLayout invoke error:", err);
			}
		}
		return layout;
	}

	/**
	 * オーバーレイ権限リクエスト・案内コマンド
	 * @returns {Promise<string>}
	 */
	async requestOverlayPermission(): Promise<string> {
		if (isTauriAvailable()) {
			try {
				const result = await this._invoke("request_overlay_permission");
				this._isOverlayEnabled = true;
				this._dispatch(ANDROID_EVENTS.OVERLAY_MODE_CHANGED, {
					enabled: true,
					detail: result,
				});
				return result as string;
			} catch (err) {
				console.warn("requestOverlayPermission error:", err);
				throw err;
			}
		}
		// Web / モック環境フォールバック
		this._isOverlayEnabled = true;
		const fallbackMsg =
			"Web/デスクトップ環境のためオーバーレイ権限は擬似的に許可されました";
		this._dispatch(ANDROID_EVENTS.OVERLAY_MODE_CHANGED, {
			enabled: true,
			detail: fallbackMsg,
		});
		return fallbackMsg;
	}

	/**
	 * フォアグラウンドサービス通知チャネル設定
	 * @param {boolean} enabled
	 * @returns {Promise<string>}
	 */
	async setupForegroundService(enabled: boolean): Promise<string> {
		if (isTauriAvailable()) {
			try {
				const result = await this._invoke("setup_foreground_service", {
					enabled,
				});
				this._isForegroundServiceActive = enabled;
				return result as string;
			} catch (err) {
				console.warn("setupForegroundService error:", err);
				throw err;
			}
		}
		this._isForegroundServiceActive = enabled;
		return `常駐モード状態 (Webモック): ${enabled}`;
	}

	/**
	 * オーバーレイ透明度設定 (0.0 〜 1.0)
	 * @param {number} alpha
	 * @returns {Promise<number>}
	 */
	async setOverlayTransparency(alpha: unknown) {
		const parsed = Number(alpha);
		const safeAlpha = Number.isFinite(parsed) ? parsed : 1.0;
		const clamped = Math.max(0.0, Math.min(1.0, safeAlpha));
		if (isTauriAvailable()) {
			try {
				await this._invoke("set_overlay_transparency", { alpha: clamped });
			} catch (err) {
				console.warn("setOverlayTransparency invoke error, falling back:", err);
			}
		}
		this._overlayTransparency = clamped;
		this._dispatch(ANDROID_EVENTS.OVERLAY_TRANSPARENCY_CHANGED, {
			alpha: clamped,
		});
		return clamped;
	}

	/**
	 * クリックスルー設定（背面タッチ透過の切り替え）
	 * @param {boolean} enabled
	 * @returns {Promise<boolean>}
	 */
	async setClickThrough(enabled: boolean) {
		const val = Boolean(enabled);
		if (isTauriAvailable()) {
			try {
				await this._invoke("set_click_through", { enabled: val });
			} catch (err) {
				console.warn("setClickThrough invoke error, falling back:", err);
			}
		}
		this._isClickThrough = val;
		this._dispatch(ANDROID_EVENTS.CLICK_THROUGH_CHANGED, {
			enabled: val,
		});
		return val;
	}

	/**
	 * クリックスルー（背面タッチ透過）状態を反転
	 * @returns {Promise<boolean>}
	 */
	async toggleClickThrough() {
		return this.setClickThrough(!this._isClickThrough);
	}

	/**
	 * フォアグラウンドサービス稼働状態を反転
	 * @returns {Promise<string>}
	 */
	async toggleForegroundService() {
		return this.setupForegroundService(!this._isForegroundServiceActive);
	}

	/**
	 * Android低メモリ通知 (ComponentCallbacks2.onTrimMemory) の処理
	 * @param {number|string} level トリムレベル (例: 10, 15, 20, 40, 60, 80)
	 * @returns {Promise<number>}
	 */
	async trimMemory(level = 40) {
		const parsed = Number(level);
		const numLevel = Number.isFinite(parsed) && parsed >= 0 ? parsed : 40;
		if (isTauriAvailable()) {
			try {
				await this._invoke("trim_memory_command", { level: numLevel });
			} catch (err) {
				console.warn("trimMemory invoke error, falling back:", err);
			}
		}
		this._dispatch(ANDROID_EVENTS.TRIM_MEMORY, {
			level: numLevel,
			timestamp: Date.now(),
		});
		return numLevel;
	}

	/**
	 * 状態をリセット
	 */
	reset() {
		this._isForegroundServiceActive = false;
		this._isOverlayEnabled = false;
		this._overlayTransparency = 1.0;
		this._isClickThrough = false;
		this._isUnified = false;
	}
}
