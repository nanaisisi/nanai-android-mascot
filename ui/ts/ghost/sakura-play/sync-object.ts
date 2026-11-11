/**
 * @file sync-object.ts
 * @brief UKADOC準拠の名前付き同期オブジェクト管理クラス (Slot-05)
 */

export interface SyncObjectWaiter {
	resolve: (value: boolean) => void;
	reject: (reason?: unknown) => void;
	timer: unknown;
	resetOnWait: boolean;
}

export interface SyncObjectInfo {
	name: string;
	signaled: boolean;
	waiterCount: number;
}

export class SyncObject {
	name: string;
	signaled: boolean;
	waiters: Set<SyncObjectWaiter>;

	constructor(name: string) {
		this.name = name;
		this.signaled = false;
		this.waiters = new Set();
	}

	get waiterCount(): number {
		return this.waiters.size;
	}

	isWaiting(): boolean {
		return this.waiters.size > 0;
	}

	hasWaiters(): boolean {
		return this.waiters.size > 0;
	}

	/**
	 * シグナルをセットし、待機中キューの先頭（または resetOnWait: false の場合は連続）を解放する
	 */
	set() {
		this.signaled = true;
		if (this.waiters.size > 0) {
			const waitersList = Array.from(this.waiters);
			for (const waiter of waitersList) {
				if (waiter.timer) {
					clearTimeout(waiter.timer as number);
				}
				this.waiters.delete(waiter);
				const shouldReset = waiter.resetOnWait;
				if (shouldReset) {
					this.signaled = false;
				}
				waiter.resolve(true);
				if (shouldReset) {
					break;
				}
			}
		}
	}

	/**
	 * すべての待機中Promiseを一斉に解放し、resetOnWait 設定にかかわらず全員にシグナルを同報する (Broadcast)
	 * @param resetAfterAll すべての待機者に通知後、シグナルをリセットするか (デフォルト: true)
	 */
	pulse(resetAfterAll: boolean = true) {
		const waitersList = Array.from(this.waiters);
		this.waiters.clear();
		for (const waiter of waitersList) {
			if (waiter.timer) {
				clearTimeout(waiter.timer as number);
			}
			waiter.resolve(true);
		}
		this.signaled = !resetAfterAll;
	}

	/**
	 * 全待機者を解放し、シグナルをセット状態（signaled: true）に維持する
	 */
	setAll() {
		this.pulse(false);
	}

	reset() {
		this.signaled = false;
	}

	cancelAll(reason: string = "SyncObject cancelled") {
		const waitersList = Array.from(this.waiters);
		this.waiters.clear();
		for (const waiter of waitersList) {
			if (waiter.timer) {
				clearTimeout(waiter.timer as number);
			}
			waiter.reject(new Error(reason));
		}
	}

	async wait(
		optionsOrTimeout: number | { timeout?: number; resetOnWait?: boolean } = 0,
		legacyResetOnWait: boolean = true,
	): Promise<boolean> {
		let timeoutMs = 0;
		let resetOnWait = true;

		if (typeof optionsOrTimeout === "number") {
			timeoutMs = optionsOrTimeout;
			resetOnWait = legacyResetOnWait;
		} else if (optionsOrTimeout && typeof optionsOrTimeout === "object") {
			timeoutMs = optionsOrTimeout.timeout ?? 0;
			if (optionsOrTimeout.resetOnWait !== undefined) {
				resetOnWait = optionsOrTimeout.resetOnWait;
			}
		}

		if (this.signaled) {
			if (resetOnWait) {
				this.signaled = false;
			}
			return true;
		}

		return new Promise((resolve, reject) => {
			let timer: unknown = null;
			const waiter: SyncObjectWaiter = {
				resolve,
				reject,
				timer,
				resetOnWait,
			};

			if (timeoutMs > 0) {
				timer = setTimeout(() => {
					this.waiters.delete(waiter);
					resolve(false);
				}, timeoutMs);
				waiter.timer = timer;
			}

			this.waiters.add(waiter);
		});
	}
}

export class SyncObjectManager {
	objects: Map<string, SyncObject>;

	constructor() {
		this.objects = new Map();
	}

	getOrCreate(name: string): SyncObject {
		const key = name.toLowerCase();
		let obj = this.objects.get(key);
		if (!obj) {
			obj = new SyncObject(key);
			this.objects.set(key, obj);
		}
		return obj;
	}

	get(name: string): SyncObject | undefined {
		return this.objects.get(name.toLowerCase());
	}

	has(name: string): boolean {
		return this.objects.has(name.toLowerCase());
	}

	getNames(): string[] {
		return Array.from(this.objects.values()).map((o) => o.name);
	}

	getAllInfo(): SyncObjectInfo[] {
		return Array.from(this.objects.values()).map((o) => ({
			name: o.name,
			signaled: o.signaled,
			waiterCount: o.waiterCount,
		}));
	}

	isSignaled(name: string): boolean {
		const obj = this.objects.get(name.toLowerCase());
		return Boolean(obj?.signaled);
	}

	set(name: string) {
		this.getOrCreate(name).set();
	}

	setAll(name: string) {
		this.getOrCreate(name).setAll();
	}

	pulse(name: string, resetAfterAll: boolean = true) {
		this.getOrCreate(name).pulse(resetAfterAll);
	}

	reset(name: string) {
		const obj = this.objects.get(name.toLowerCase());
		if (obj) obj.reset();
	}

	resetAll() {
		for (const obj of this.objects.values()) {
			obj.reset();
		}
	}

	remove(name: string, reason: string = "SyncObject removed"): boolean {
		const key = name.toLowerCase();
		const obj = this.objects.get(key);
		if (obj) {
			obj.cancelAll(reason);
			return this.objects.delete(key);
		}
		return false;
	}

	size(): number {
		return this.objects.size;
	}

	clear(reason: string = "SyncObject cancelled") {
		for (const obj of this.objects.values()) {
			obj.cancelAll(reason);
		}
		this.objects.clear();
	}

	async wait(
		name: string,
		optionsOrTimeout: number | { timeout?: number; resetOnWait?: boolean } = 0,
		resetOnWait: boolean = true,
	): Promise<boolean> {
		return await this.getOrCreate(name).wait(optionsOrTimeout, resetOnWait);
	}
}
