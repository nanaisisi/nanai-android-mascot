/**
 * @file sync-object.ts
 * @brief UKADOC準拠の名前付き同期オブジェクト管理クラス (Slot-05)
 */

export class SyncObject {
	name: string;
	signaled: boolean;
	waiters: Set<{
		resolve: (...args: unknown[]) => unknown;
		reject: (...args: unknown[]) => unknown;
		timer: unknown;
		resetOnWait: boolean;
	}>;

	constructor(name: string) {
		this.name = name;
		this.signaled = false;
		this.waiters = new Set();
	}

	set() {
		this.signaled = true;
		if (this.waiters.size > 0) {
			const waitersList = Array.from(this.waiters);
			for (const waiter of waitersList) {
				if (waiter.timer) {
					clearTimeout(waiter.timer as number);
				}
				this.waiters.delete(waiter);
				if (waiter.resetOnWait) {
					this.signaled = false;
					waiter.resolve(true);
					break;
				}
				waiter.resolve(true);
			}
		}
	}

	reset() {
		this.signaled = false;
	}

	async wait(
		timeoutMs: number = 0,
		resetOnWait: boolean = false,
	): Promise<boolean> {
		if (this.signaled) {
			if (resetOnWait) {
				this.signaled = false;
			}
			return true;
		}

		return new Promise((resolve, reject) => {
			let timer: unknown = null;
			const waiter = {
				resolve: resolve as (...args: unknown[]) => unknown,
				reject: reject as (...args: unknown[]) => unknown,
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
		let obj = this.objects.get(name);
		if (!obj) {
			obj = new SyncObject(name);
			this.objects.set(name, obj);
		}
		return obj;
	}

	set(name: string) {
		this.getOrCreate(name).set();
	}

	reset(name: string) {
		this.getOrCreate(name).reset();
	}

	async wait(
		name: string,
		timeoutMs: number = 0,
		resetOnWait: boolean = false,
	): Promise<boolean> {
		return await this.getOrCreate(name).wait(timeoutMs, resetOnWait);
	}
}
