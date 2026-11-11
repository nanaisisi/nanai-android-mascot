/**
 * @file async-parallel.ts
 * @brief TypeScript 非同期並列実行基盤 (AsyncPool, mapParallel, retryAsync, withTimeout)
 *
 * 15並列分散実行・大規模リソース一括ロード・IPC並行制御における
 * CPU・I/O枯渇やリソース競合を抑止するための高信頼性非同期タスクエンジン。
 */

export type AsyncTask<T> = () => Promise<T> | T;

export interface ParallelOptions {
	/**
	 * 同時実行数上限 (1以上の正数、デフォルト: 4)
	 */
	concurrency?: number;
	/**
	 * タスクエラー発生時に後続タスクを停止して即時 reject するか (デフォルト: true)
	 */
	stopOnError?: boolean;
	/**
	 * キャンセル用 AbortSignal
	 */
	signal?: AbortSignal;
	/**
	 * 個別タスクまたは全体のタイムアウトミリ秒 (0の場合は無制限)
	 */
	timeoutMs?: number;
	/**
	 * タスク完了時 (成功/失敗問わず) の進捗通知コールバック
	 */
	onProgress?: (completed: number, total: number) => void;
}

export interface RetryOptions {
	/**
	 * 最大試行回数 (初回実行を含む、最小 1、デフォルト: 3)
	 */
	maxAttempts?: number;
	/**
	 * 初回リトライ待機時間 (ミリ秒、デフォルト: 100)
	 */
	initialDelayMs?: number;
	/**
	 * 最大待機時間 (ミリ秒、デフォルト: 5000)
	 */
	maxDelayMs?: number;
	/**
	 * 指数バックオフ係数 (デフォルト: 2.0)
	 */
	backoffMultiplier?: number;
	/**
	 * リトライ実行可否判定関数 (falseを返した場合はリトライせず即時中断)
	 */
	retryIf?: (error: unknown, attempt: number) => boolean;
	/**
	 * 中断用 AbortSignal
	 */
	signal?: AbortSignal;
}

export interface Deferred<T> {
	promise: Promise<T>;
	resolve: (value: T | PromiseLike<T>) => void;
	reject: (reason?: unknown) => void;
	readonly isSettled: boolean;
	readonly isResolved: boolean;
	readonly isRejected: boolean;
}

export interface AsyncPoolStats {
	activeCount: number;
	pendingCount: number;
	completedCount: number;
	failedCount: number;
	concurrency: number;
	isPaused: boolean;
	isIdle: boolean;
}

interface QueuedTask<T> {
	task: AsyncTask<T>;
	priority: number;
	deferred: Deferred<T>;
	signal?: AbortSignal;
}

/**
 * 手動で resolve/reject 可能な Deferred オブジェクトを生成する
 */
export function createDeferred<T>(): Deferred<T> {
	let resolveFn!: (value: T | PromiseLike<T>) => void;
	let rejectFn!: (reason?: unknown) => void;
	let settled = false;
	let resolved = false;
	let rejected = false;

	const promise = new Promise<T>((res, rej) => {
		resolveFn = (val) => {
			if (settled) return;
			settled = true;
			resolved = true;
			res(val);
		};
		rejectFn = (reason) => {
			if (settled) return;
			settled = true;
			rejected = true;
			rej(reason);
		};
	});

	return {
		promise,
		resolve: resolveFn,
		reject: rejectFn,
		get isSettled() {
			return settled;
		},
		get isResolved() {
			return resolved;
		},
		get isRejected() {
			return rejected;
		},
	};
}

/**
 * 中断可能な指定ミリ秒待機 Promise
 */
export function delay(ms: number, signal?: AbortSignal): Promise<void> {
	if (signal?.aborted) {
		return Promise.reject(signal.reason ?? new Error("Delay aborted"));
	}
	if (ms <= 0) return Promise.resolve();

	return new Promise((resolve, reject) => {
		const timer = setTimeout(() => {
			signal?.removeEventListener("abort", onAbort);
			resolve();
		}, ms);

		function onAbort() {
			clearTimeout(timer);
			signal?.removeEventListener("abort", onAbort);
			reject(signal?.reason ?? new Error("Delay aborted"));
		}

		signal?.addEventListener("abort", onAbort, { once: true });
	});
}

/**
 * Promise または非同期関数にタイムアウト制限を付与する
 */
export async function withTimeout<T>(
	promiseOrFn: Promise<T> | AsyncTask<T>,
	timeoutMs: number,
	errorMessage?: string,
): Promise<T> {
	if (timeoutMs <= 0 || !Number.isFinite(timeoutMs)) {
		return typeof promiseOrFn === "function" ? promiseOrFn() : promiseOrFn;
	}

	let timer: ReturnType<typeof setTimeout> | undefined;
	const timeoutPromise = new Promise<never>((_, reject) => {
		timer = setTimeout(() => {
			reject(
				new Error(errorMessage || `Operation timed out after ${timeoutMs}ms`),
			);
		}, timeoutMs);
	});

	try {
		const targetPromise =
			typeof promiseOrFn === "function" ? promiseOrFn() : promiseOrFn;
		return await Promise.race([targetPromise, timeoutPromise]);
	} finally {
		if (timer !== undefined) clearTimeout(timer);
	}
}

/**
 * 指数バックオフ付き非同期タスク自動リトライ
 */
export async function retryAsync<T>(
	fn: (attempt: number) => Promise<T> | T,
	options: RetryOptions = {},
): Promise<T> {
	const maxAttempts = Math.max(1, options.maxAttempts ?? 3);
	const initialDelayMs = Math.max(0, options.initialDelayMs ?? 100);
	const maxDelayMs = Math.max(initialDelayMs, options.maxDelayMs ?? 5000);
	const backoffMultiplier = Math.max(1, options.backoffMultiplier ?? 2.0);
	const retryIf = options.retryIf ?? (() => true);
	const signal = options.signal;

	let currentDelay = initialDelayMs;

	for (let attempt = 1; attempt <= maxAttempts; attempt++) {
		if (signal?.aborted) {
			throw signal.reason ?? new Error("Retry operation aborted");
		}

		try {
			return await fn(attempt);
		} catch (error) {
			if (attempt >= maxAttempts || !retryIf(error, attempt)) {
				throw error;
			}

			await delay(currentDelay, signal);
			currentDelay = Math.min(maxDelayMs, currentDelay * backoffMultiplier);
		}
	}

	throw new Error(`Exceeded maximum retry attempts: ${maxAttempts}`);
}

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

/**
 * 配列の各要素に対して並列度制限付きで非同期マッピング関数を実行する
 */
export async function mapParallel<T, R>(
	items: readonly T[],
	mapper: (item: T, index: number, array: readonly T[]) => Promise<R> | R,
	options: ParallelOptions = {},
): Promise<R[]> {
	const total = items.length;
	if (total === 0) return [];

	const concurrency = Math.max(1, Math.min(total, options.concurrency ?? 4));
	const stopOnError = options.stopOnError ?? true;
	const signal = options.signal;
	const timeoutMs = options.timeoutMs ?? 0;
	const onProgress = options.onProgress;

	if (signal?.aborted) {
		throw signal.reason ?? new Error("mapParallel aborted");
	}

	const results = new Array<R>(total);
	let completed = 0;
	let hasError = false;
	let firstError: unknown = null;
	let nextIndex = 0;

	async function worker(): Promise<void> {
		while (nextIndex < total) {
			if (hasError && stopOnError) return;
			if (signal?.aborted) {
				hasError = true;
				firstError = signal.reason ?? new Error("mapParallel aborted");
				return;
			}

			const currentIndex = nextIndex++;
			const item = items[currentIndex];

			try {
				let resultPromise = Promise.resolve(mapper(item, currentIndex, items));
				if (timeoutMs > 0) {
					resultPromise = withTimeout(resultPromise, timeoutMs);
				}
				results[currentIndex] = await resultPromise;
			} catch (err) {
				if (!hasError) {
					hasError = true;
					firstError = err;
				}
				if (stopOnError) return;
			} finally {
				completed++;
				onProgress?.(completed, total);
			}
		}
	}

	const workerPromises: Promise<void>[] = [];
	for (let i = 0; i < concurrency; i++) {
		workerPromises.push(worker());
	}

	await Promise.all(workerPromises);

	if (hasError && stopOnError) {
		throw firstError;
	}

	return results;
}

/**
 * 配列の各要素に対して全結果（成功/失敗）を PromiseSettledResult 配列として収集する
 */
export async function allSettledParallel<T, R>(
	items: readonly T[],
	mapper: (item: T, index: number, array: readonly T[]) => Promise<R> | R,
	options: Omit<ParallelOptions, "stopOnError"> = {},
): Promise<PromiseSettledResult<R>[]> {
	const total = items.length;
	if (total === 0) return [];

	const settledResults = new Array<PromiseSettledResult<R>>(total);

	await mapParallel(
		items,
		async (item, index, arr) => {
			try {
				const val = await mapper(item, index, arr);
				settledResults[index] = { status: "fulfilled", value: val };
			} catch (reason) {
				settledResults[index] = { status: "rejected", reason };
			}
		},
		{
			...options,
			stopOnError: false,
		},
	);

	return settledResults;
}

/**
 * 配列の各要素に対して並列に非同期条件判定を行い、マッチした要素を抽出する
 */
export async function filterParallel<T>(
	items: readonly T[],
	predicate: (
		item: T,
		index: number,
		array: readonly T[],
	) => Promise<boolean> | boolean,
	options: ParallelOptions = {},
): Promise<T[]> {
	const matches = await mapParallel(
		items,
		async (item, index, arr) => {
			const res = await predicate(item, index, arr);
			return Boolean(res);
		},
		options,
	);

	const filtered: T[] = [];
	for (let i = 0; i < items.length; i++) {
		if (matches[i]) {
			filtered.push(items[i]);
		}
	}
	return filtered;
}

/**
 * 配列をバッチ（チャンク）に分割し、各バッチを並列度制御付きで実行する
 */
export async function batchParallel<T, R>(
	items: readonly T[],
	batchSize: number,
	batchProcessor: (batch: T[], batchIndex: number) => Promise<R> | R,
	options: ParallelOptions = {},
): Promise<R[]> {
	const size = Math.max(1, Math.floor(batchSize));
	const batches: T[][] = [];

	for (let i = 0; i < items.length; i += size) {
		batches.push(items.slice(i, i + size));
	}

	return mapParallel(
		batches,
		(batch, batchIdx) => batchProcessor(batch, batchIdx),
		options,
	);
}
