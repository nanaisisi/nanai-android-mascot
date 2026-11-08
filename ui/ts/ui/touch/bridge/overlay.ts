/**
 * @file overlay.js
 * @description Slot-12 Android プラットフォーム判別 & オーバーレイ・フォアグラウンドサービス制御
 * Contract: OverlayManager, isAndroidPlatform, isNativeAndroidPlatform
 */

import { invoke, isTauriAvailable } from "../../../core/tauri-helper.js";
import { ANDROID_EVENTS } from "./constants.js";

/**
 * Android環境かどうかを判定
 * @returns {boolean}
 */
export function isAndroidPlatform() {
	if (typeof navigator === "undefined" || !navigator.userAgent) {
		return false;
	}
	return /android/i.test(navigator.userAgent);
}

/**
 * Tauriネイティブ環境かつAndroidであるか判定
 * @returns {boolean}
 */
export function isNativeAndroidPlatform() {
	return isTauriAvailable() && isAndroidPlatform();
}

/**
 * オーバーレイおよびプラットフォームIPC機能を管理するクラス
 */
export class OverlayManager {
	_invoke: unknown;
	_dispatch: unknown;
	_isForegroundServiceActive: boolean;
	_isOverlayEnabled: boolean;
	_overlayTransparency: number;
	_isClickThrough: boolean;
	/**
	 * @param {object} [options={}]
	 * @param {Function} [options.invokeHandler] カスタムinvoke関数
	 * @param {Function} [options.dispatchFn] イベントディスパッチ用コールバック
	 */
	constructor(options = {}) {
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
	 * オーバーレイ権限リクエスト・案内コマンド
	 * @returns {Promise<string>}
	 */
	async requestOverlayPermission() {
		if (isTauriAvailable()) {
			try {
				const result = await this._invoke("request_overlay_permission");
				this._isOverlayEnabled = true;
				this._dispatch(ANDROID_EVENTS.OVERLAY_MODE_CHANGED, {
					enabled: true,
					detail: result,
				});
				return result;
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
	async setupForegroundService(enabled: boolean) {
		if (isTauriAvailable()) {
			try {
				const result = await this._invoke("setup_foreground_service", {
					enabled,
				});
				this._isForegroundServiceActive = enabled;
				return result;
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
	}
}
