/**
 * @file android-bridge.js
 * @description Slot-12 Android プラットフォームブリッジ & ライフサイクル・オーバーレイ制御
 * Contract: AndroidBridge, イベント命名規約 nas:android:*
 */

import { invoke, isTauriAvailable } from "../../core/tauri-helper.js";

/**
 * AndroidBridge イベント定数
 */
export const ANDROID_EVENTS = {
	PAUSE: "nas:android:pause",
	RESUME: "nas:android:resume",
	OVERLAY_MODE_CHANGED: "nas:android:overlay-mode-changed",
};

/**
 * AndroidプラットフォームとのIPCおよびライフサイクル管理を提供するブリッジクラス
 */
export class AndroidBridge {
	/**
	 * @param {object} [options={}]
	 * @param {Function} [options.invokeHandler] カスタムinvoke関数（テスト用）
	 */
	constructor(options = {}) {
		this._invoke = options.invokeHandler || invoke;
		this._listeners = new Map();
		this._isForegroundServiceActive = false;
		this._isOverlayEnabled = false;

		// ブラウザ/WebViewの可視性変更を監視してライフサイクルイベントを発火
		this._setupVisibilityListeners();
	}

	/**
	 * Android環境かどうかを判定
	 * @returns {boolean}
	 */
	isAndroid() {
		if (typeof navigator === "undefined" || !navigator.userAgent) {
			return false;
		}
		return /android/i.test(navigator.userAgent);
	}

	/**
	 * Tauriネイティブ環境かつAndroidであるか
	 * @returns {boolean}
	 */
	isNativeAndroid() {
		return isTauriAvailable() && this.isAndroid();
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
	async setupForegroundService(enabled) {
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
	 * 現在のオーバーレイおよびサービス稼働状態を取得
	 * @returns {{ isAndroid: boolean, isOverlayEnabled: boolean, isForegroundServiceActive: boolean }}
	 */
	getState() {
		return {
			isAndroid: this.isAndroid(),
			isOverlayEnabled: this._isOverlayEnabled,
			isForegroundServiceActive: this._isForegroundServiceActive,
		};
	}

	/**
	 * イベントリスナーの登録
	 * @param {string} eventName
	 * @param {Function} callback
	 * @returns {() => void} リスナー解除関数
	 */
	on(eventName, callback) {
		if (!this._listeners.has(eventName)) {
			this._listeners.set(eventName, new Set());
		}
		this._listeners.get(eventName).add(callback);

		return () => {
			this.off(eventName, callback);
		};
	}

	/**
	 * イベントリスナーの解除
	 * @param {string} eventName
	 * @param {Function} callback
	 */
	off(eventName, callback) {
		const set = this._listeners.get(eventName);
		if (set) {
			set.delete(callback);
			if (set.size === 0) {
				this._listeners.delete(eventName);
			}
		}
	}

	/**
	 * 内部イベントディスパッチ
	 * @private
	 * @param {string} eventName
	 * @param {any} data
	 */
	_dispatch(eventName, data) {
		const set = this._listeners.get(eventName);
		if (set) {
			for (const cb of set) {
				try {
					cb(data);
				} catch (e) {
					console.error(`AndroidBridge event error in ${eventName}:`, e);
				}
			}
		}
	}

	/**
	 * ライフサイクル (VisibilityState) リスナーの設定
	 * @private
	 */
	_setupVisibilityListeners() {
		if (
			typeof document !== "undefined" &&
			typeof document.addEventListener === "function"
		) {
			document.addEventListener("visibilitychange", () => {
				if (document.hidden) {
					this._dispatch(ANDROID_EVENTS.PAUSE, { timestamp: Date.now() });
				} else {
					this._dispatch(ANDROID_EVENTS.RESUME, { timestamp: Date.now() });
				}
			});
		}
	}
}
