/**
 * @file sync-object.ts
 * @brief UKADOC準拠の名前付き同期オブジェクト管理クラス (Slot-05)
 */

export class SyncObject {
	name: string;
	signaled: boolean;
	waiters: Set<{
		resolve: Function;
		reject: Function;
		timer: any;
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
					clearTimeout(waiter.timer);
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

	wait(
		options: { timeout?: number; resetOnWait?: boolean } = {},
	): Promise<boolean> {
		const { timeout = 0, resetOnWait = true } = options;

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
				timer: null as any,
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
	objects: Map<string, SyncObject>;

	constructor() {
		this.objects = new Map();
	}

	getOrCreate(name: string): SyncObject {
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

	set(name: string) {
		const obj = this.getOrCreate(name);
		obj.set();
	}

	reset(name: string) {
		const key = String(name || "")
			.trim()
			.toLowerCase();
		const obj = this.objects.get(key);
		if (obj) {
			obj.reset();
		}
	}

	async wait(
		name: string,
		options: { timeout?: number; resetOnWait?: boolean } = {},
	): Promise<boolean> {
		const obj = this.getOrCreate(name);
		return await obj.wait(options);
	}

	isSignaled(name: string): boolean {
		const key = String(name || "")
			.trim()
			.toLowerCase();
		return this.objects.get(key)?.signaled ?? false;
	}

	clear() {
		for (const obj of this.objects.values()) {
			obj.cancelAll();
		}
		this.objects.clear();
	}
}
