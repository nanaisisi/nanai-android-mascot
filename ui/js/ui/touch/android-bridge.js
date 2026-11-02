/**
 * @file android-bridge.js
 * @description Slot-12 Android プラットフォームブリッジ & ライフサイクル・オーバーレイ制御
 * Contract: AndroidBridge, イベント命名規約 nas:android:*
 */

import { BackButtonManager } from "./bridge/back-button.js";
import {
	ANDROID_EVENTS,
	ANDROID_LIFECYCLE_STATES,
} from "./bridge/constants.js";
import { setupVisibilityListeners } from "./bridge/lifecycle.js";
import {
	isAndroidPlatform,
	isNativeAndroidPlatform,
	OverlayManager,
} from "./bridge/overlay.js";

export {
	ANDROID_EVENTS,
	ANDROID_LIFECYCLE_STATES,
	BackButtonManager,
	OverlayManager,
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
		this._listeners = new Map();
		this._cleanupFns = [];
		this._dockState = "none"; // "none" | "left" | "right"
		this._lifecycleState = ANDROID_LIFECYCLE_STATES.ACTIVE;
		this._gestureRecognizer = null;

		// 戻るボタン管理モジュール
		this._backButtonManager = new BackButtonManager((eventName, data) => {
			this._dispatch(eventName, data);
		});

		// オーバーレイ & プラットフォーム管理モジュール
		this._overlayManager = new OverlayManager({
			invokeHandler: options.invokeHandler,
			dispatchFn: (eventName, data) => {
				this._dispatch(eventName, data);
			},
		});

		if (options.gestureRecognizer) {
			this.setGestureRecognizer(options.gestureRecognizer);
		}

		// ブラウザ/WebViewの可視性変更およびライフサイクル監視
		const visibilityCleanups = setupVisibilityListeners({
			setLifecycleState: (state) => {
				this._lifecycleState = state;
			},
			getGestureRecognizer: () => this._gestureRecognizer,
			dispatch: (eventName, data) => {
				this._dispatch(eventName, data);
			},
		});
		this._cleanupFns.push(...visibilityCleanups);
	}

	/**
	 * 内部で保持している戻るボタンハンドラ配列へのプロキシ（後方互換・内部参照用）
	 * @private
	 */
	get _backHandlers() {
		return this._backButtonManager._backHandlers;
	}

	set _backHandlers(val) {
		this._backButtonManager._backHandlers = val;
	}

	/**
	 * 内部オーバーレイ透過度（後方互換・内部参照用）
	 * @private
	 */
	get _overlayTransparency() {
		return this._overlayManager.overlayTransparency;
	}

	set _overlayTransparency(val) {
		this._overlayManager._overlayTransparency = val;
	}

	/**
	 * 内部クリックスルーフラグ（後方互換・内部参照用）
	 * @private
	 */
	get _isClickThrough() {
		return this._overlayManager.isClickThrough;
	}

	set _isClickThrough(val) {
		this._overlayManager._isClickThrough = val;
	}

	/**
	 * 内部フォアグラウンドサービス稼働フラグ（後方互換・内部参照用）
	 * @private
	 */
	get _isForegroundServiceActive() {
		return this._overlayManager.isForegroundServiceActive;
	}

	set _isForegroundServiceActive(val) {
		this._overlayManager._isForegroundServiceActive = val;
	}

	/**
	 * 内部オーバーレイ有効フラグ（後方互換・内部参照用）
	 * @private
	 */
	get _isOverlayEnabled() {
		return this._overlayManager.isOverlayEnabled;
	}

	set _isOverlayEnabled(val) {
		this._overlayManager._isOverlayEnabled = val;
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
		return isAndroidPlatform();
	}

	/**
	 * Tauriネイティブ環境かつAndroidであるか
	 * @returns {boolean}
	 */
	isNativeAndroid() {
		return isNativeAndroidPlatform();
	}

	/**
	 * オーバーレイ権限リクエスト・案内コマンド
	 * @returns {Promise<string>}
	 */
	async requestOverlayPermission() {
		return this._overlayManager.requestOverlayPermission();
	}

	/**
	 * フォアグラウンドサービス通知チャネル設定
	 * @param {boolean} enabled
	 * @returns {Promise<string>}
	 */
	async setupForegroundService(enabled) {
		return this._overlayManager.setupForegroundService(enabled);
	}

	/**
	 * オーバーレイ透明度設定 (0.0 〜 1.0)
	 * @param {number} alpha
	 * @returns {Promise<number>}
	 */
	async setOverlayTransparency(alpha) {
		return this._overlayManager.setOverlayTransparency(alpha);
	}

	/**
	 * クリックスルー設定（背面タッチ透過の切り替え）
	 * @param {boolean} enabled
	 * @returns {Promise<boolean>}
	 */
	async setClickThrough(enabled) {
		return this._overlayManager.setClickThrough(enabled);
	}

	/**
	 * Android低メモリ通知 (ComponentCallbacks2.onTrimMemory) の処理
	 * @param {number|string} level トリムレベル (例: 10, 15, 20, 40, 60, 80)
	 * @returns {Promise<number>}
	 */
	async trimMemory(level = 40) {
		return this._overlayManager.trimMemory(level);
	}

	/**
	 * Android戻るボタンハンドラを登録 (スタック方式)
	 * @param {() => boolean|Promise<boolean>} handler trueを返すと戻る処理を消費(consume)したとみなす
	 * @returns {() => void} 登録解除関数
	 */
	registerBackHandler(handler) {
		return this._backButtonManager.registerBackHandler(handler);
	}

	/**
	 * Android戻るボタン押下イベントの処理
	 * スタックの末尾（最前面）から順にハンドラを実行し、trueが返されたら停止
	 * @returns {Promise<boolean>} ハンドラによって処理されたかどうか
	 */
	async handleBackButton() {
		return this._backButtonManager.handleBackButton();
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
	 * @returns {{ isAndroid: boolean, isOverlayEnabled: boolean, isForegroundServiceActive: boolean, lifecycleState: string, overlayTransparency: number, isClickThrough: boolean, isThrottled: boolean, dockState: string }}
	 */
	getState() {
		return {
			isAndroid: this.isAndroid(),
			isOverlayEnabled: this._overlayManager.isOverlayEnabled,
			isForegroundServiceActive: this._overlayManager.isForegroundServiceActive,
			lifecycleState: this._lifecycleState,
			overlayTransparency: this._overlayManager.overlayTransparency,
			isClickThrough: this._overlayManager.isClickThrough,
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
		this._backButtonManager.clear();
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
}
