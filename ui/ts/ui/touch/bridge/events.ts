/**
 * @file events.js
 * @description Slot-12 AndroidBridge イベントリスナー管理およびディスパッチモジュール
 * Contract: BridgeEventEmitter
 */

export type BridgeEventCallback<T = unknown> = (data: T) => void;
type StoredBridgeCallback = (data: unknown) => void;

/**
 * AndroidBridge 内部イベントの購読とディスパッチを担うイベントエミッター
 */
export class BridgeEventEmitter {
	_listeners: Map<string, Set<StoredBridgeCallback>>;
	constructor() {
		this._listeners = new Map();
	}

	/**
	 * リスナーMapの参照を取得
	 * @returns {Map<string, Set<StoredBridgeCallback>>}
	 */
	get listeners(): Map<string, Set<StoredBridgeCallback>> {
		return this._listeners;
	}

	/**
	 * イベントリスナーの登録
	 * @param {string} eventName
	 * @param {BridgeEventCallback<T> | null | undefined} callback
	 * @returns {() => void} リスナー解除関数
	 */
	on<T = unknown>(
		eventName: string,
		callback: BridgeEventCallback<T> | null | undefined,
	): () => void {
		if (typeof callback !== "function") {
			return () => {};
		}
		let set = this._listeners.get(eventName);
		if (!set) {
			set = new Set();
			this._listeners.set(eventName, set);
		}
		set.add(callback as unknown as StoredBridgeCallback);

		return () => {
			this.off(eventName, callback);
		};
	}

	/**
	 * イベントリスナーの解除
	 * @param {string} eventName
	 * @param {BridgeEventCallback<T> | null | undefined} callback
	 */
	off<T = unknown>(
		eventName: string,
		callback: BridgeEventCallback<T> | null | undefined,
	) {
		if (typeof callback !== "function") return;
		const set = this._listeners.get(eventName);
		if (set) {
			set.delete(callback as unknown as StoredBridgeCallback);
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
	dispatch(eventName: string, data?: unknown) {
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
	listenerCount(eventName?: string): number {
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
