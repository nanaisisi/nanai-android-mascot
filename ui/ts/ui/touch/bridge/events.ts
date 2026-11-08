/**
 * @file events.js
 * @description Slot-12 AndroidBridge イベントリスナー管理およびディスパッチモジュール
 * Contract: BridgeEventEmitter
 */

/**
 * AndroidBridge 内部イベントの購読とディスパッチを担うイベントエミッター
 */
export class BridgeEventEmitter {
	_listeners: Map<unknown, unknown>;
	constructor() {
		/** @type {Map<string, Set<Function>>} */
		this._listeners = new Map();
	}

	/**
	 * リスナーMapの参照を取得
	 * @returns {Map<string, Set<Function>>}
	 */
	get listeners() {
		return this._listeners;
	}

	/**
	 * イベントリスナーの登録
	 * @param {string} eventName
	 * @param {Function} callback
	 * @returns {() => void} リスナー解除関数
	 */
	on(eventName: unknown, callback: unknown) {
		if (typeof callback !== "function") {
			return () => {};
		}
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
	off(eventName: unknown, callback: unknown) {
		const set = this._listeners.get(eventName);
		if (set) {
			set.delete(callback);
			if (set.size === 0) {
				this._listeners.delete(eventName);
			}
		}
	}

	/**
	 * イベントディスパッチ
	 * @param {string} eventName
	 * @param {unknown} data
	 */
	dispatch(eventName: unknown, data: unknown) {
		const set = this._listeners.get(eventName);
		if (set) {
			for (const cb of Array.from(set)) {
				try {
					cb(data);
				} catch (e) {
					console.error(`AndroidBridge event error in ${eventName}:`, e);
				}
			}
		}
	}

	/**
	 * 指定イベントまたは全イベントのリスナー数を取得
	 * @param {string} [eventName]
	 * @returns {number}
	 */
	listenerCount(eventName: unknown) {
		if (eventName) {
			return this._listeners.get(eventName)?.size ?? 0;
		}
		let total = 0;
		for (const set of this._listeners.values()) {
			total += set.size;
		}
		return total;
	}

	/**
	 * 全リスナーの解除
	 */
	clear() {
		this._listeners.clear();
	}
}
