/**
 * @file types.ts
 * @brief Async parallel execution base types and interfaces
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

export interface QueuedTask<T> {
	task: AsyncTask<T>;
	priority: number;
	deferred: Deferred<T>;
	signal?: AbortSignal;
}
