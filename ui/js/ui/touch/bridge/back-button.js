/**
 * @file back-button.js
 * @description Slot-12 Android 戻るボタンハンドラ管理 (スタック方式 / LIFO)
 * Contract: BackButtonManager
 */

import { ANDROID_EVENTS } from "./constants.js";

/**
 * Android戻るボタンハンドラを管理するクラス
 */
export class BackButtonManager {
	/**
	 * @param {Function} [dispatchFn] イベントディスパッチ用コールバック
	 */
	constructor(dispatchFn) {
		this._dispatch = typeof dispatchFn === "function" ? dispatchFn : () => {};
		this._backHandlers = [];
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
	 * 登録されているハンドラを全クリア
	 */
	clear() {
		this._backHandlers = [];
	}

	/**
	 * 現在登録されているハンドラ数を取得（デバッグ/テスト用）
	 * @returns {number}
	 */
	get handlerCount() {
		return this._backHandlers.length;
	}
}
