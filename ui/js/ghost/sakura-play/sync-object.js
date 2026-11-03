/**
 * @file sync-object.js
 * @brief UKADOC準拠の名前付き同期オブジェクト管理クラス (Slot-05)
 *
 * \![set,syncobject,名前], \![reset,syncobject,名前], \![wait,syncobject,名前,オプション] をサポート。
 * 複数の非同期スクリプト実行や協調動作時の同期プリミティブを提供します。
 */

export class SyncObject {
	/**
	 * @param {string} name
	 */
	constructor(name) {
		this.name = name;
		this.signaled = false;
		/** @type {Set<{ resolve: Function, reject: Function, timer: any, resetOnWait: boolean }>} */
		this.waiters = new Set();
	}

	/**
	 * オブジェクトをシグナル状態にする
	 */
	set() {
		this.signaled = true;
		if (this.waiters.size > 0) {
			const waitersList = Array.from(this.waiters);
			for (const waiter of waitersList) {
				if (waiter.timer) {
					clearTimeout(waiter.timer);
				}
				this.waiters.delete(waiter);
				if (waiter.resetOnWait) {
					// 1つ消費して非シグナル化 (Mutex / Semaphore(1) 相当)
					this.signaled = false;
					waiter.resolve(true);
					break;
				}
				waiter.resolve(true);
			}
		}
	}

	/**
	 * オブジェクトを非シグナル状態にする
	 */
	reset() {
		this.signaled = false;
	}

	/**
	 * シグナル化を待機
	 * @param {object} [options]
	 * @param {number} [options.timeout=0] ミリ秒 (0で無限待機)
	 * @param {boolean} [options.resetOnWait=true] 待機後に非シグナル化するか
	 * @returns {Promise<boolean>} true: シグナル受信, false: タイムアウト
	 */
	wait(options = {}) {
		const { timeout = 0, resetOnWait = true } = options;

		// 既にシグナル状態の場合
		if (this.signaled) {
			if (resetOnWait) {
				this.signaled = false;
			}
			return Promise.resolve(true);
		}

		return new Promise((resolve, reject) => {
			const waiter = {
				resolve,
				reject,
				timer: null,
				resetOnWait,
			};

			if (timeout > 0) {
				waiter.timer = setTimeout(() => {
					this.waiters.delete(waiter);
					resolve(false);
				}, timeout);
			}

			this.waiters.add(waiter);
		});
	}

	/**
	 * 保留中の全待機者をキャンセル・解放
	 * @param {string} [reason="SyncObject cancelled"]
	 */
	cancelAll(reason = "SyncObject cancelled") {
		for (const waiter of this.waiters) {
			if (waiter.timer) {
				clearTimeout(waiter.timer);
			}
			waiter.reject(new Error(reason));
		}
		this.waiters.clear();
	}
}

export class SyncObjectManager {
	constructor() {
		/** @type {Map<string, SyncObject>} */
		this.objects = new Map();
	}

	/**
	 * 名前付き同期オブジェクトを取得（存在しなければ生成）
	 * @param {string} name
	 * @returns {SyncObject}
	 */
	getOrCreate(name) {
		const key = String(name || "")
			.trim()
			.toLowerCase();
		let obj = this.objects.get(key);
		if (!obj) {
			obj = new SyncObject(key);
			this.objects.set(key, obj);
		}
		return obj;
	}

	/**
	 * オブジェクトをシグナル状態にする (\![set,syncobject,名前])
	 * @param {string} name
	 */
	set(name) {
		const obj = this.getOrCreate(name);
		obj.set();
	}

	/**
	 * オブジェクトを非シグナル状態にする (\![reset,syncobject,名前])
	 * @param {string} name
	 */
	reset(name) {
		const key = String(name || "")
			.trim()
			.toLowerCase();
		const obj = this.objects.get(key);
		if (obj) {
			obj.reset();
		}
	}

	/**
	 * オブジェクトのシグナル化を待機 (\![wait,syncobject,名前,オプション])
	 * @param {string} name
	 * @param {object} [options]
	 * @returns {Promise<boolean>}
	 */
	async wait(name, options = {}) {
		const obj = this.getOrCreate(name);
		return await obj.wait(options);
	}

	/**
	 * オブジェクトのシグナル状態を取得
	 * @param {string} name
	 * @returns {boolean}
	 */
	isSignaled(name) {
		const key = String(name || "")
			.trim()
			.toLowerCase();
		return this.objects.get(key)?.signaled ?? false;
	}

	/**
	 * 全同期オブジェクトの待機をキャンセルしクリーンアップ
	 */
	clear() {
		for (const obj of this.objects.values()) {
			obj.cancelAll();
		}
		this.objects.clear();
	}
}
