/**
 * @file dock.js
 * @description Slot-12 Android ドッキング・エッジスナップおよびジェスチャー認識器連携モジュール
 * Contract: DockManager
 */

import { ANDROID_EVENTS } from "./constants.js";

export interface DockManagerOptions {
	dispatchFn?: (eventName: string, data: unknown) => void;
	gestureRecognizer?: unknown;
	element?: unknown;
	dockMargin?: number;
	autoRestoreOnTap?: boolean;
}

export interface GestureRecognizerInterface {
	on?: (
		eventName: string,
		callback: (event: { dockState: string }) => void,
	) => () => void;
	setDockState?: (state: string) => void;
	destroy?: () => void;
	[key: string]: unknown;
}

/**
 * ゴースト画面端ドッキング状態およびジェスチャー認識器との連携を管理するクラス
 */
export class DockManager {
	_dispatch: (eventName: string, data: unknown) => void;
	_dockState: string;
	_gestureRecognizer: GestureRecognizerInterface | null;
	_gestureUnbind: (() => void) | null;
	_attachedElement: HTMLElement | null;
	_elementClickUnbind: (() => void) | null;
	_dockMargin: number;
	_autoRestoreOnTap: boolean;

	/**
	 * @param {DockManagerOptions} [options={}]
	 */
	constructor(options: DockManagerOptions = {}) {
		this._dispatch =
			typeof options.dispatchFn === "function" ? options.dispatchFn : () => {};
		this._dockState = "none"; // "none" | "left" | "right"
		this._gestureRecognizer = null;
		this._gestureUnbind = null;
		this._attachedElement = null;
		this._elementClickUnbind = null;

		const margin = Number(options.dockMargin);
		this._dockMargin = Number.isFinite(margin) && margin >= 0 ? margin : 0;
		this._autoRestoreOnTap = options.autoRestoreOnTap !== false;

		if (options.gestureRecognizer) {
			this.setGestureRecognizer(options.gestureRecognizer);
		}
		if (options.element) {
			this.attachElement(options.element);
		}
	}

	/**
	 * ドッキング設定を取得
	 * @returns {{ dockMargin: number, autoRestoreOnTap: boolean }}
	 */
	getDockOptions() {
		return {
			dockMargin: this._dockMargin,
			autoRestoreOnTap: this._autoRestoreOnTap,
		};
	}

	/**
	 * ドッキング設定を動的に更新
	 * @param {Partial<DockManagerOptions>} [options={}]
	 * @returns {{ dockMargin: number, autoRestoreOnTap: boolean }}
	 */
	setDockOptions(options: Partial<DockManagerOptions> = {}) {
		let changed = false;
		if (options.dockMargin !== undefined) {
			const margin = Number(options.dockMargin);
			const safeMargin = Number.isFinite(margin) && margin >= 0 ? margin : 0;
			if (this._dockMargin !== safeMargin) {
				this._dockMargin = safeMargin;
				changed = true;
			}
		}
		if (options.autoRestoreOnTap !== undefined) {
			const autoRestore = Boolean(options.autoRestoreOnTap);
			if (this._autoRestoreOnTap !== autoRestore) {
				this._autoRestoreOnTap = autoRestore;
				changed = true;
			}
		}
		if (changed) {
			this._dispatch(ANDROID_EVENTS.DOCK_OPTIONS_CHANGED, {
				dockMargin: this._dockMargin,
				autoRestoreOnTap: this._autoRestoreOnTap,
				timestamp: Date.now(),
			});
		}
		return this.getDockOptions();
	}

	/**
	 * 連動中のDOM要素を取得
	 * @returns {HTMLElement|null}
	 */
	get attachedElement(): HTMLElement | null {
		return this._attachedElement;
	}

	/**
	 * ゴースト・マスコットDOM要素をドッキング管理にアタッチ
	 * ドッキングクラス (is-docked-left, is-docked-right) を動的に同期し、
	 * ドッキング状態でのタップ/クリックで自動展開(restore)するリスナーを登録
	 * @param {HTMLElement} element
	 */
	attachElement(element: unknown) {
		if (this._attachedElement === element) {
			return;
		}
		this.detachElement();

		if (!element) return;
		this._attachedElement = element as HTMLElement;

		// 現在のドッキング状態を反映
		this._syncElementClasses();

		// ドッキング時のタップ/クリックによる復帰リスナー
		const handleTapRestore = (e: {
			stopPropagation: () => void;
			preventDefault: () => void;
		}) => {
			if (this.isDocked) {
				if (typeof e?.stopPropagation === "function") {
					e.stopPropagation();
				}
				if (typeof e?.preventDefault === "function") {
					e.preventDefault();
				}
				if (this._autoRestoreOnTap) {
					this.restore();
				}
			}
		};

		const el = this._attachedElement;
		if (typeof el.addEventListener === "function") {
			el.addEventListener("click", handleTapRestore);
			el.addEventListener("touchend", handleTapRestore);
			this._elementClickUnbind = () => {
				if (typeof el.removeEventListener === "function") {
					el.removeEventListener("click", handleTapRestore);
					el.removeEventListener("touchend", handleTapRestore);
				}
			};
		}
	}

	/**
	 * アタッチ中のDOM要素を解除し、ドッキングクラスをクリーンアップ
	 */
	detachElement() {
		if (this._elementClickUnbind) {
			try {
				this._elementClickUnbind();
			} catch (_) {}
			this._elementClickUnbind = null;
		}
		if (this._attachedElement) {
			try {
				if (this._attachedElement.classList?.remove) {
					this._attachedElement.classList.remove(
						"is-docked-left",
						"is-docked-right",
					);
				}
			} catch (_) {}
			this._attachedElement = null;
		}
	}

	/**
	 * アタッチされた要素へドッキングクラスを同期
	 * @private
	 */
	_syncElementClasses() {
		if (!this._attachedElement) return;
		try {
			if (this._attachedElement.classList?.remove) {
				this._attachedElement.classList.remove(
					"is-docked-left",
					"is-docked-right",
				);
			}
			if (this._dockState === "left" && this._attachedElement.classList?.add) {
				this._attachedElement.classList.add("is-docked-left");
			} else if (
				this._dockState === "right" &&
				this._attachedElement.classList?.add
			) {
				this._attachedElement.classList.add("is-docked-right");
			}
		} catch (_) {}
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
	 * @returns {GestureRecognizerInterface|null}
	 */
	get gestureRecognizer(): GestureRecognizerInterface | null {
		return this._gestureRecognizer;
	}

	/**
	 * 連携するジェスチャー認識器を設定
	 * @param {unknown} recognizer
	 * @returns {(() => void)|null} 登録解除関数
	 */
	setGestureRecognizer(recognizer: unknown) {
		if (this._gestureUnbind) {
			try {
				this._gestureUnbind();
			} catch (_) {}
			this._gestureUnbind = null;
		}

		this._gestureRecognizer =
			(recognizer as GestureRecognizerInterface) ?? null;
		if (
			this._gestureRecognizer &&
			typeof this._gestureRecognizer.on === "function"
		) {
			this._gestureUnbind = this._gestureRecognizer.on(
				"nam:touch:snap",
				(event: { dockState: string }) => {
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
	setDockMode(dockState: unknown) {
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
			this._syncElementClasses();
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
	 * ジェスチャー認識器、アタッチ要素および内部状態の破棄・クリーンアップ
	 */
	destroy() {
		this.detachElement();
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
