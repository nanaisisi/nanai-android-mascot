/**
 * @file retry.ts
 * @brief Exponential backoff async retry helper
 */

import { delay } from "./deferred.js";
import type { RetryOptions } from "./types.js";

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
