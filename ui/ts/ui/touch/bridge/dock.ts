/**
 * @file dock.js
 * @description Slot-12 Android ドッキング・エッジスナップおよびジェスチャー認識器連携モジュール
 * Contract: DockManager
 */

import { ANDROID_EVENTS } from "./constants.js";

/**
 * ゴースト画面端ドッキング状態およびジェスチャー認識器との連携を管理するクラス
 */
export class DockManager {
	/**
	 * @param {object} [options={}]
	 * @param {Function} [options.dispatchFn] イベントディスパッチ用コールバック
	 * @param {TouchGestureRecognizer} [options.gestureRecognizer] 連携するジェスチャー認識器
	 */
	constructor(options = {}) {
		this._dispatch =
			typeof options.dispatchFn === "function" ? options.dispatchFn : () => {};
		this._dockState = "none"; // "none" | "left" | "right"
		this._gestureRecognizer = null;
		this._gestureUnbind = null;

		if (options.gestureRecognizer) {
			this.setGestureRecognizer(options.gestureRecognizer);
		}
	}

	/**
	 * 現在のドッキング・スナップモードを取得
	 * @returns {"none" | "left" | "right"}
	 */
	get dockState() {
		return this._dockState;
	}

	set dockState(val) {
		this.setDockMode(val);
	}

	/**
	 * 画面端にドッキング（退避）されているか判定
	 * @returns {boolean}
	 */
	get isDocked() {
		return this._dockState === "left" || this._dockState === "right";
	}

	/**
	 * 画面端へ折りたたみ退避
	 * @param {"left" | "right"} [edge="right"]
	 * @returns {"none" | "left" | "right"}
	 */
	collapse(edge = "right") {
		const targetEdge = edge === "left" ? "left" : "right";
		return this.setDockMode(targetEdge);
	}

	/**
	 * ドッキング状態から元の浮遊状態に復帰
	 * @returns {"none" | "left" | "right"}
	 */
	restore() {
		return this.setDockMode("none");
	}

	/**
	 * ドッキング状態から元の浮遊状態に復帰 (restore のエイリアス)
	 * @returns {"none" | "left" | "right"}
	 */
	expand() {
		return this.restore();
	}

	/**
	 * ドッキング退避と復帰をトグル切り替え
	 * @param {"left" | "right"} [edge="right"]
	 * @returns {"none" | "left" | "right"}
	 */
	toggle(edge = "right") {
		if (this.isDocked) {
			return this.restore();
		}
		return this.collapse(edge);
	}

	/**
	 * 連携中のジェスチャー認識器を取得
	 * @returns {TouchGestureRecognizer|null}
	 */
	get gestureRecognizer() {
		return this._gestureRecognizer;
	}

	/**
	 * 連携するジェスチャー認識器を設定
	 * @param {TouchGestureRecognizer|null} recognizer
	 * @returns {(() => void)|null} 登録解除関数
	 */
	setGestureRecognizer(recognizer) {
		if (this._gestureUnbind) {
			try {
				this._gestureUnbind();
			} catch (_) {}
			this._gestureUnbind = null;
		}

		this._gestureRecognizer = recognizer;
		if (
			this._gestureRecognizer &&
			typeof this._gestureRecognizer.on === "function"
		) {
			this._gestureUnbind = this._gestureRecognizer.on(
				"nam:touch:snap",
				(event) => {
					if (event?.dockState) {
						this.setDockMode(event.dockState);
					}
				},
			);
			return this._gestureUnbind;
		}
		return null;
	}

	/**
	 * ドッキング・スナップモードを設定
	 * @param {"none" | "left" | "right"} dockState
	 * @returns {"none" | "left" | "right"}
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
	 * ジェスチャー認識器および内部状態の破棄・クリーンアップ
	 */
	destroy() {
		if (this._gestureUnbind) {
			try {
				this._gestureUnbind();
			} catch (_) {}
			this._gestureUnbind = null;
		}
		if (
			this._gestureRecognizer &&
			typeof this._gestureRecognizer.destroy === "function"
		) {
			this._gestureRecognizer.destroy();
		}
		this._gestureRecognizer = null;
		this._dockState = "none";
	}
}
