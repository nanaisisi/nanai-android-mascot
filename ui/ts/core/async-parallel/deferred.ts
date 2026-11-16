/**
 * @file deferred.ts
 * @brief Deferred promise and abortable delay utilities
 */

import type { Deferred } from "./types.js";

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
