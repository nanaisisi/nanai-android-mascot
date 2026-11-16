/**
 * @file operators.ts
 * @brief Parallel collection operators (mapParallel, allSettledParallel, filterParallel, batchParallel)
 */

import { withTimeout } from "./timeout.js";
import type { ParallelOptions } from "./types.js";

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
