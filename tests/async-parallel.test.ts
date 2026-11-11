/**
 * @file async-parallel.test.ts
 * @brief TypeScript 非同期並列実行エンジン (AsyncPool, mapParallel, retryAsync, withTimeout) 網羅テスト
 */
import { describe, expect, it, vi } from "vitest";
import {
	AsyncPool,
	allSettledParallel,
	batchParallel,
	createAsyncPool,
	createDeferred,
	delay,
	filterParallel,
	mapParallel,
	retryAsync,
	withTimeout,
} from "../ui/ts/core/async-parallel.js";

describe("createDeferred and delay", () => {
	it("resolves value and updates settlement flags", async () => {
		const def = createDeferred<number>();
		expect(def.isSettled).toBe(false);
		expect(def.isResolved).toBe(false);
		expect(def.isRejected).toBe(false);

		def.resolve(42);
		expect(def.isSettled).toBe(true);
		expect(def.isResolved).toBe(true);
		expect(def.isRejected).toBe(false);

		// Subsequent resolve/reject are ignored
		def.resolve(99);
		def.reject(new Error("ignored"));

		const val = await def.promise;
		expect(val).toBe(42);
	});

	it("rejects error and updates settlement flags", async () => {
		const def = createDeferred<string>();
		def.reject(new Error("fail"));
		expect(def.isSettled).toBe(true);
		expect(def.isResolved).toBe(false);
		expect(def.isRejected).toBe(true);

		await expect(def.promise).rejects.toThrow("fail");
	});

	it("delay resolves after time and responds to AbortSignal", async () => {
		const start = Date.now();
		await delay(20);
		expect(Date.now() - start).toBeGreaterThanOrEqual(15);

		// Non-positive delay resolves immediately
		await delay(0);
		await delay(-10);

		// Aborted immediately
		const controller = new AbortController();
		controller.abort(new Error("Already stopped"));
		await expect(delay(50, controller.signal)).rejects.toThrow(
			"Already stopped",
		);

		// Aborted while waiting
		const ctrl2 = new AbortController();
		const p = delay(200, ctrl2.signal);
		setTimeout(() => ctrl2.abort(new Error("Cancelled")), 10);
		await expect(p).rejects.toThrow("Cancelled");
	});
});

describe("withTimeout", () => {
	it("resolves if task finishes before timeout", async () => {
		const res = await withTimeout(async () => {
			await delay(10);
			return "ok";
		}, 100);
		expect(res).toBe("ok");

		// Direct promise input
		const directRes = await withTimeout(Promise.resolve(123), 50);
		expect(directRes).toBe(123);

		// Non-positive timeout bypasses race
		const bypass = await withTimeout(Promise.resolve("fast"), 0);
		expect(bypass).toBe("fast");
	});

	it("rejects with custom error message on timeout", async () => {
		await expect(
			withTimeout(
				async () => {
					await delay(100);
					return "late";
				},
				15,
				"Custom timeout exceeded",
			),
		).rejects.toThrow("Custom timeout exceeded");
	});
});

describe("retryAsync", () => {
	it("returns result without retry on first attempt success", async () => {
		const fn = vi.fn().mockResolvedValue("success");
		const res = await retryAsync(fn, { maxAttempts: 3 });
		expect(res).toBe("success");
		expect(fn).toHaveBeenCalledTimes(1);
		expect(fn).toHaveBeenCalledWith(1);
	});

	it("retries on error with backoff and succeeds", async () => {
		let attempts = 0;
		const fn = vi.fn(async () => {
			attempts++;
			if (attempts < 3) throw new Error(`Fail ${attempts}`);
			return "recovered";
		});

		const res = await retryAsync(fn, {
			maxAttempts: 4,
			initialDelayMs: 5,
			backoffMultiplier: 1.5,
		});
		expect(res).toBe("recovered");
		expect(fn).toHaveBeenCalledTimes(3);
	});

	it("stops retrying if retryIf returns false", async () => {
		const fn = vi.fn(async () => {
			throw new Error("fatal_error");
		});

		await expect(
			retryAsync(fn, {
				maxAttempts: 5,
				initialDelayMs: 5,
				retryIf: (err) => (err as Error).message !== "fatal_error",
			}),
		).rejects.toThrow("fatal_error");

		expect(fn).toHaveBeenCalledTimes(1);
	});

	it("aborts when signal is triggered", async () => {
		const ctrl = new AbortController();
		ctrl.abort(new Error("Stop retry"));

		await expect(
			retryAsync(() => Promise.resolve("ok"), { signal: ctrl.signal }),
		).rejects.toThrow("Stop retry");
	});
});

describe("AsyncPool", () => {
	it("throttles concurrency and tracks telemetry", async () => {
		const pool = createAsyncPool(2);
		expect(pool.concurrency).toBe(2);
		expect(pool.isIdle).toBe(true);

		let maxActive = 0;
		let currentlyRunning = 0;

		const createTask = (id: number, timeMs: number) => async () => {
			currentlyRunning++;
			maxActive = Math.max(maxActive, currentlyRunning);
			await delay(timeMs);
			currentlyRunning--;
			return id;
		};

		const p1 = pool.add(createTask(1, 40));
		const p2 = pool.add(createTask(2, 40));
		const p3 = pool.add(createTask(3, 40));
		const p4 = pool.add(createTask(4, 40));

		expect(pool.activeCount).toBeLessThanOrEqual(2);
		expect(pool.pendingCount).toBe(2);
		expect(pool.isIdle).toBe(false);

		const results = await Promise.all([p1, p2, p3, p4]);
		expect(results).toEqual([1, 2, 3, 4]);
		expect(maxActive).toBe(2);
		expect(pool.isIdle).toBe(true);
		expect(pool.completedCount).toBe(4);
		expect(pool.failedCount).toBe(0);

		const stats = pool.getStats();
		expect(stats.completedCount).toBe(4);
		expect(stats.activeCount).toBe(0);
		expect(stats.pendingCount).toBe(0);
	});

	it("respects priority queue ordering", async () => {
		const pool = new AsyncPool(1);
		const executionOrder: string[] = [];

		const makeTask =
			(name: string, delayMs = 15) =>
			async () => {
				await delay(delayMs);
				executionOrder.push(name);
				return name;
			};

		// First task starts immediately
		const p1 = pool.add(makeTask("task-1"), { priority: 0 });
		// Subsequent tasks queued with different priorities
		const pLow = pool.add(makeTask("task-low"), { priority: -1 });
		const pHigh = pool.add(makeTask("task-high"), { priority: 10 });
		const pMid = pool.add(makeTask("task-mid"), { priority: 5 });

		await Promise.all([p1, pLow, pHigh, pMid]);
		expect(executionOrder).toEqual([
			"task-1",
			"task-high",
			"task-mid",
			"task-low",
		]);
	});

	it("supports pause, resume, and dynamic concurrency adjustment", async () => {
		const pool = new AsyncPool(1);
		pool.pause();
		expect(pool.isPaused).toBe(true);

		const taskExecuted = vi.fn().mockResolvedValue("res");
		const p = pool.add(taskExecuted);

		await delay(20);
		expect(taskExecuted).not.toHaveBeenCalled();
		expect(pool.pendingCount).toBe(1);

		pool.resume();
		expect(pool.isPaused).toBe(false);

		await p;
		expect(taskExecuted).toHaveBeenCalledTimes(1);

		// Dynamic concurrency expansion drains extra tasks
		pool.concurrency = 4;
		expect(pool.concurrency).toBe(4);
	});

	it("handles task rejection and clear()", async () => {
		const pool = new AsyncPool(2);
		const pFail = pool.add(async () => {
			throw new Error("fail_task");
		});

		await expect(pFail).rejects.toThrow("fail_task");
		expect(pool.failedCount).toBe(1);

		// Pause and clear queue
		pool.pause();
		const pPending1 = pool.add(() => delay(10));
		const pPending2 = pool.add(() => delay(10));
		expect(pool.pendingCount).toBe(2);

		pool.clear("Custom cancel");
		await expect(pPending1).rejects.toThrow("Custom cancel");
		await expect(pPending2).rejects.toThrow("Custom cancel");
		expect(pool.pendingCount).toBe(0);
	});

	it("waits for onEmpty and onIdle", async () => {
		const pool = new AsyncPool(2);
		expect(await pool.onEmpty()).toBeUndefined();
		expect(await pool.onIdle()).toBeUndefined();

		pool.add(() => delay(20));
		pool.add(() => delay(30));
		pool.add(() => delay(40));

		const emptyPromise = pool.onEmpty();
		const idlePromise = pool.onIdle();

		await emptyPromise;
		expect(pool.pendingCount).toBe(0);

		await idlePromise;
		expect(pool.isIdle).toBe(true);
	});

	it("supports task cancellation via AbortSignal", async () => {
		const pool = new AsyncPool(1);
		const ctrlImmediate = new AbortController();
		ctrlImmediate.abort(new Error("Pre-aborted"));

		await expect(
			pool.add(() => delay(10), { signal: ctrlImmediate.signal }),
		).rejects.toThrow("Pre-aborted");

		// Aborted while waiting in queue
		const blocker = pool.add(() => delay(40));
		const ctrlQueued = new AbortController();
		const queuedPromise = pool.add(() => "never", {
			signal: ctrlQueued.signal,
		});

		ctrlQueued.abort(new Error("Aborted in queue"));
		await expect(queuedPromise).rejects.toThrow("Aborted in queue");
		await blocker;
	});
});

describe("Collection Parallel Operators", () => {
	it("mapParallel transforms items with concurrency throttle and onProgress", async () => {
		const items = [1, 2, 3, 4, 5];
		const progressEvents: [number, number][] = [];

		const results = await mapParallel(
			items,
			async (item) => {
				await delay(10);
				return item * 10;
			},
			{
				concurrency: 2,
				onProgress: (done, total) => progressEvents.push([done, total]),
			},
		);

		expect(results).toEqual([10, 20, 30, 40, 50]);
		expect(progressEvents.length).toBe(5);
		expect(progressEvents[4]).toEqual([5, 5]);

		// Empty input
		expect(await mapParallel([], () => 1)).toEqual([]);
	});

	it("mapParallel stops on error when stopOnError is true", async () => {
		const items = [1, 2, 3, 4];
		await expect(
			mapParallel(
				items,
				async (val) => {
					if (val === 2) throw new Error("Item 2 failed");
					await delay(20);
					return val;
				},
				{ concurrency: 2, stopOnError: true },
			),
		).rejects.toThrow("Item 2 failed");
	});

	it("allSettledParallel collects all results and errors without failing", async () => {
		const items = ["a", "b", "c"];
		const settled = await allSettledParallel(
			items,
			async (item) => {
				if (item === "b") throw new Error("Error on b");
				return item.toUpperCase();
			},
			{ concurrency: 2 },
		);

		expect(settled).toEqual([
			{ status: "fulfilled", value: "A" },
			{ status: "rejected", reason: expect.any(Error) },
			{ status: "fulfilled", value: "C" },
		]);
		expect((settled[1] as PromiseRejectedResult).reason.message).toBe(
			"Error on b",
		);

		// Empty input
		expect(await allSettledParallel([], () => 1)).toEqual([]);
	});

	it("filterParallel extracts items matching async predicate", async () => {
		const items = [10, 15, 20, 25, 30];
		const filtered = await filterParallel(
			items,
			async (item) => {
				await delay(5);
				return item % 20 === 0;
			},
			{ concurrency: 3 },
		);

		expect(filtered).toEqual([20]);
	});

	it("batchParallel chunks array and executes batch processors", async () => {
		const items = [1, 2, 3, 4, 5, 6, 7];
		const batchSums = await batchParallel(
			items,
			3,
			async (batch, idx) => {
				const sum = batch.reduce((a, b) => a + b, 0);
				return { idx, sum, count: batch.length };
			},
			{ concurrency: 2 },
		);

		expect(batchSums).toEqual([
			{ idx: 0, sum: 6, count: 3 },
			{ idx: 1, sum: 15, count: 3 },
			{ idx: 2, sum: 7, count: 1 },
		]);
	});
});
