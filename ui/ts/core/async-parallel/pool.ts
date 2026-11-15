/**
 * @file pool.ts
 * @brief AsyncPool task execution pool with concurrency and priority control
 */

import { AsyncTask, AsyncPoolStats, QueuedTask, Deferred } from "./types.js";
import { createDeferred } from "./deferred.js";

/**
 * 同時実行数制限・優先度キュー・一時停止/再開を備えた非同期タスクプール
 */
export class AsyncPool {
	private _concurrency: number;
	private _activeCount = 0;
	private _completedCount = 0;
	private _failedCount = 0;
	private _isPaused = false;
	private _queue: QueuedTask<unknown>[] = [];
	private _idleWaiters: (() => void)[] = [];
	private _emptyWaiters: (() => void)[] = [];

	constructor(concurrency = 4) {
		this._concurrency = Math.max(1, Math.floor(concurrency));
	}

	get concurrency(): number {
		return this._concurrency;
	}

	set concurrency(value: number) {
		const prev = this._concurrency;
		this._concurrency = Math.max(1, Math.floor(value));
		if (this._concurrency > prev) {
			this._drain();
		}
	}

	get activeCount(): number {
		return this._activeCount;
	}

	get pendingCount(): number {
		return this._queue.length;
	}

	get completedCount(): number {
		return this._completedCount;
	}

	get failedCount(): number {
		return this._failedCount;
	}

	get isPaused(): boolean {
		return this._isPaused;
	}

	get isIdle(): boolean {
		return this._activeCount === 0 && this._queue.length === 0;
	}

	/**
	 * プールのテレメトリステータスを取得する
	 */
	getStats(): AsyncPoolStats {
		return {
			activeCount: this._activeCount,
			pendingCount: this._queue.length,
			completedCount: this._completedCount,
			failedCount: this._failedCount,
			concurrency: this._concurrency,
			isPaused: this._isPaused,
			isIdle: this.isIdle,
		};
	}

	/**
	 * タスクをプールに追加して実行キューに入れる
	 */
	add<T>(
		task: AsyncTask<T>,
		options: { priority?: number; signal?: AbortSignal } = {},
	): Promise<T> {
		const deferred = createDeferred<T>();
		const priority = options.priority ?? 0;
		const signal = options.signal;

		if (signal?.aborted) {
			deferred.reject(signal.reason ?? new Error("Task aborted before queued"));
			return deferred.promise;
		}

		const item: QueuedTask<unknown> = {
			task: task as AsyncTask<unknown>,
			priority,
			deferred: deferred as Deferred<unknown>,
			signal,
		};

		// 優先度降順でキューに挿入 (同優先度はFIFO)
		if (
			this._queue.length === 0 ||
			priority <= (this._queue[this._queue.length - 1]?.priority ?? 0)
		) {
			this._queue.push(item);
		} else {
			const index = this._queue.findIndex((q) => q.priority < priority);
			if (index === -1) {
				this._queue.push(item);
			} else {
				this._queue.splice(index, 0, item);
			}
		}

		if (signal) {
			const onAbort = () => {
				const qIndex = this._queue.indexOf(item);
				if (qIndex !== -1) {
					this._queue.splice(qIndex, 1);
					deferred.reject(
						signal.reason ?? new Error("Task aborted while pending"),
					);
					this._checkEmptyWaiters();
					this._checkIdleWaiters();
				}
			};
			signal.addEventListener("abort", onAbort, { once: true });
		}

		this._drain();
		return deferred.promise;
	}

	/**
	 * キューの新規実行を一時停止する (実行中のタスクは継続)
	 */
	pause(): void {
		this._isPaused = true;
	}

	/**
	 * キューの実行を再開する
	 */
	resume(): void {
		if (!this._isPaused) return;
		this._isPaused = false;
		this._drain();
	}

	/**
	 * 未実行の保留タスクをすべて破棄し、指定の理由で reject する
	 */
	clear(reason = "AsyncPool cleared"): void {
		const pending = [...this._queue];
		this._queue = [];
		for (const item of pending) {
			item.deferred.reject(new Error(reason));
		}
		this._checkEmptyWaiters();
		this._checkIdleWaiters();
	}

	/**
	 * 保留キューが空になるまで待機する
	 */
	onEmpty(): Promise<void> {
		if (this._queue.length === 0) return Promise.resolve();
		return new Promise((resolve) => {
			this._emptyWaiters.push(resolve);
		});
	}

	/**
	 * キューおよび実行中タスクがすべて完了 (アイドル状態) になるまで待機する
	 */
	onIdle(): Promise<void> {
		if (this.isIdle) return Promise.resolve();
		return new Promise((resolve) => {
			this._idleWaiters.push(resolve);
		});
	}

	private _drain(): void {
		if (this._isPaused) return;

		while (this._activeCount < this._concurrency && this._queue.length > 0) {
			const queued = this._queue.shift();
			if (!queued) break;

			if (queued.signal?.aborted) {
				queued.deferred.reject(
					queued.signal.reason ?? new Error("Task aborted before execution"),
				);
				continue;
			}

			this._activeCount++;
			this._executeTask(queued);
		}

		if (this._queue.length === 0) {
			this._checkEmptyWaiters();
		}
		if (this.isIdle) {
			this._checkIdleWaiters();
		}
	}

	private async _executeTask(queued: QueuedTask<unknown>): Promise<void> {
		try {
			const result = await queued.task();
			this._completedCount++;
			queued.deferred.resolve(result);
		} catch (err) {
			this._failedCount++;
			queued.deferred.reject(err);
		} finally {
			this._activeCount--;
			this._drain();
		}
	}

	private _checkEmptyWaiters(): void {
		if (this._queue.length === 0 && this._emptyWaiters.length > 0) {
			const waiters = [...this._emptyWaiters];
			this._emptyWaiters = [];
			for (const w of waiters) w();
		}
	}

	private _checkIdleWaiters(): void {
		if (this.isIdle && this._idleWaiters.length > 0) {
			const waiters = [...this._idleWaiters];
			this._idleWaiters = [];
			for (const w of waiters) w();
		}
	}
}

/**
 * AsyncPool ファクトリ関数
 */
export function createAsyncPool(concurrency = 4): AsyncPool {
	return new AsyncPool(concurrency);
}
