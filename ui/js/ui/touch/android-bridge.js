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
	STOP: "nas:android:stop",
	OVERLAY_MODE_CHANGED: "nas:android:overlay-mode-changed",
	STATE_CHANGED: "nas:android:state-changed",
	OVERLAY_TRANSPARENCY_CHANGED: "nas:android:overlay-transparency-changed",
	CLICK_THROUGH_CHANGED: "nas:android:click-through-changed",
	TRIM_MEMORY: "nas:android:trim-memory",
	BACK_BUTTON: "nas:android:back-button",
	DOCK_CHANGED: "nas:android:dock-changed",
};

/**
 * ライフサイクル状態定数
 */
export const ANDROID_LIFECYCLE_STATES = {
	ACTIVE: "active",
	PAUSED: "paused",
	STOPPED: "stopped",
};

/**
 * AndroidプラットフォームとのIPCおよびライフサイクル管理を提供するブリッジクラス
 */
export class AndroidBridge {
	/**
	 * @param {object} [options={}]
	 * @param {Function} [options.invokeHandler] カスタムinvoke関数（テスト用）
	 * @param {TouchGestureRecognizer} [options.gestureRecognizer] 連携するジェスチャー認識器（バックグラウンド移行時のリセット用）
	 */
	constructor(options = {}) {
		this._invoke = options.invokeHandler || invoke;
		this._gestureRecognizer = null;
		this._listeners = new Map();
		this._backHandlers = [];
		this._isForegroundServiceActive = false;
		this._isOverlayEnabled = false;
		this._lifecycleState = ANDROID_LIFECYCLE_STATES.ACTIVE;
		this._dockState = "none"; // "none" | "left" | "right"
		this._overlayTransparency = 1.0;
		this._isClickThrough = false;
		this._cleanupFns = [];

		if (options.gestureRecognizer) {
			this.setGestureRecognizer(options.gestureRecognizer);
		}

		// ブラウザ/WebViewの可視性変更およびライフサイクル監視
		this._setupVisibilityListeners();
	}

	/**
	 * 連携するジェスチャー認識器を設定
	 * @param {TouchGestureRecognizer|null} recognizer
	 */
	setGestureRecognizer(recognizer) {
		this._gestureRecognizer = recognizer;
		if (
			this._gestureRecognizer &&
			typeof this._gestureRecognizer.on === "function"
		) {
			const unbind = this._gestureRecognizer.on("nas:touch:snap", (event) => {
				if (event.dockState) {
					this.setDockMode(event.dockState);
				}
			});
			this._cleanupFns.push(unbind);
		}
	}

	/**
	 * ドッキング・スナップモードを設定
	 * @param {"none" | "left" | "right"} dockState
	 */
	setDockMode(dockState) {
		const state =
			dockState === "left" || dockState === "right" ? dockState : "none";
		if (this._dockState !== state) {
			this._dockState = state;
			if (
				this._gestureRecognizer &&
				typeof this._gestureRecognizer.setDockState === "function"
			) {
				this._gestureRecognizer.setDockState(state);
			}
			this._dispatch(ANDROID_EVENTS.DOCK_CHANGED, {
				dockState: state,
				timestamp: Date.now(),
			});
		}
		return this._dockState;
	}

	/**
	 * 現在のドッキング・スナップモードを取得
	 * @returns {"none" | "left" | "right"}
	 */
	getDockMode() {
		return this._dockState;
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
	 * オーバーレイ透明度設定 (0.0 〜 1.0)
	 * @param {number} alpha
	 * @returns {Promise<number>}
	 */
	async setOverlayTransparency(alpha) {
		const clamped = Math.max(0.0, Math.min(1.0, Number(alpha) || 0));
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
	async setClickThrough(enabled) {
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
	 * Android低メモリ通知 (ComponentCallbacks2.onTrimMemory) の処理
	 * @param {number|string} level トリムレベル (例: 10, 15, 20, 40, 60, 80)
	 * @returns {Promise<number>}
	 */
	async trimMemory(level = 40) {
		const numLevel = Number(level) || 40;
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
	 * Android戻るボタンハンドラを登録 (スタック方式)
	 * @param {() => boolean|Promise<boolean>} handler trueを返すと戻る処理を消費(consume)したとみなす
	 * @returns {() => void} 登録解除関数
	 */
	registerBackHandler(handler) {
		if (typeof handler === "function") {
			this._backHandlers.push(handler);
		}
		return () => {
			this._backHandlers = this._backHandlers.filter((h) => h !== handler);
		};
	}

	/**
	 * Android戻るボタン押下イベントの処理
	 * スタックの末尾（最前面）から順にハンドラを実行し、trueが返されたら停止
	 * @returns {Promise<boolean>} ハンドラによって処理されたかどうか
	 */
	async handleBackButton() {
		this._dispatch(ANDROID_EVENTS.BACK_BUTTON, { timestamp: Date.now() });
		for (let i = this._backHandlers.length - 1; i >= 0; i--) {
			const handler = this._backHandlers[i];
			try {
				const handled = await handler();
				if (handled) {
					return true;
				}
			} catch (err) {
				console.error("Error in back button handler:", err);
			}
		}
		return false;
	}

	/**
	 * 現在のライフサイクル状態においてフレームレート抑制/省電力モードが有効か
	 * @returns {boolean}
	 */
	isThrottled() {
		return (
			this._lifecycleState === ANDROID_LIFECYCLE_STATES.PAUSED ||
			this._lifecycleState === ANDROID_LIFECYCLE_STATES.STOPPED
		);
	}

	/**
	 * 現在のオーバーレイおよびサービス稼働状態を取得
	 * @returns {{ isAndroid: boolean, isOverlayEnabled: boolean, isForegroundServiceActive: boolean, lifecycleState: string, overlayTransparency: number, isClickThrough: boolean, isThrottled: boolean }}
	 */
	getState() {
		return {
			isAndroid: this.isAndroid(),
			isOverlayEnabled: this._isOverlayEnabled,
			isForegroundServiceActive: this._isForegroundServiceActive,
			lifecycleState: this._lifecycleState,
			overlayTransparency: this._overlayTransparency,
			isClickThrough: this._isClickThrough,
			isThrottled: this.isThrottled(),
			dockState: this._dockState,
		};
	}

	/**
	 * リソースの完全破棄 (リスナー解除・タイマーリセット)
	 */
	destroy() {
		for (const cleanup of this._cleanupFns) {
			try {
				cleanup();
			} catch (err) {
				console.error("Error running cleanup in AndroidBridge:", err);
			}
		}
		this._cleanupFns = [];
		this._listeners.clear();
		this._backHandlers = [];
		if (
			this._gestureRecognizer &&
			typeof this._gestureRecognizer.destroy === "function"
		) {
			this._gestureRecognizer.destroy();
		}
		this._gestureRecognizer = null;
		this._lifecycleState = ANDROID_LIFECYCLE_STATES.STOPPED;
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
			const onVisibilityChange = () => {
				if (document.hidden) {
					this._lifecycleState = ANDROID_LIFECYCLE_STATES.PAUSED;
					if (
						this._gestureRecognizer &&
						typeof this._gestureRecognizer.reset === "function"
					) {
						this._gestureRecognizer.reset();
					}
					this._dispatch(ANDROID_EVENTS.PAUSE, { timestamp: Date.now() });
					this._dispatch(ANDROID_EVENTS.STATE_CHANGED, {
						state: ANDROID_LIFECYCLE_STATES.PAUSED,
						timestamp: Date.now(),
					});
				} else {
					this._lifecycleState = ANDROID_LIFECYCLE_STATES.ACTIVE;
					this._dispatch(ANDROID_EVENTS.RESUME, { timestamp: Date.now() });
					this._dispatch(ANDROID_EVENTS.STATE_CHANGED, {
						state: ANDROID_LIFECYCLE_STATES.ACTIVE,
						timestamp: Date.now(),
					});
				}
			};

			document.addEventListener("visibilitychange", onVisibilityChange);
			this._cleanupFns.push(() => {
				if (typeof document.removeEventListener === "function") {
					document.removeEventListener("visibilitychange", onVisibilityChange);
				}
			});

			const onFreeze = () => {
				this._lifecycleState = ANDROID_LIFECYCLE_STATES.PAUSED;
				if (
					this._gestureRecognizer &&
					typeof this._gestureRecognizer.reset === "function"
				) {
					this._gestureRecognizer.reset();
				}
				this._dispatch(ANDROID_EVENTS.PAUSE, { timestamp: Date.now() });
				this._dispatch(ANDROID_EVENTS.STATE_CHANGED, {
					state: ANDROID_LIFECYCLE_STATES.PAUSED,
					timestamp: Date.now(),
				});
			};
			document.addEventListener("freeze", onFreeze);
			this._cleanupFns.push(() => {
				if (typeof document.removeEventListener === "function") {
					document.removeEventListener("freeze", onFreeze);
				}
			});
		}

		if (
			typeof window !== "undefined" &&
			typeof window.addEventListener === "function"
		) {
			const onPageHide = (e) => {
				this._lifecycleState = ANDROID_LIFECYCLE_STATES.STOPPED;
				if (
					this._gestureRecognizer &&
					typeof this._gestureRecognizer.reset === "function"
				) {
					this._gestureRecognizer.reset();
				}
				this._dispatch(ANDROID_EVENTS.STOP, {
					persisted: Boolean(e?.persisted),
					timestamp: Date.now(),
				});
				this._dispatch(ANDROID_EVENTS.STATE_CHANGED, {
					state: ANDROID_LIFECYCLE_STATES.STOPPED,
					timestamp: Date.now(),
				});
			};

			window.addEventListener("pagehide", onPageHide);
			this._cleanupFns.push(() => {
				if (typeof window.removeEventListener === "function") {
					window.removeEventListener("pagehide", onPageHide);
				}
			});
		}
	}
}
