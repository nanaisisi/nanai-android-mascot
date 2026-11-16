/**
 * @file timeout.ts
 * @brief Timeout helper for promises and async tasks
 */

import type { AsyncTask } from "./types.js";

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
