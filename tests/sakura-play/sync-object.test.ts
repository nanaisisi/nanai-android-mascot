import assert from "node:assert/strict";
import { test } from "vitest";
import {
	SyncObject,
	SyncObjectManager,
} from "../../ui/js/ghost/sakura-play/sync-object.js";

test("SyncObject: basic set, reset, and wait", async () => {
	const sync = new SyncObject("event1");
	assert.equal(sync.signaled, false);

	// Wait asynchronously before set
	let waitFinished = false;
	const p = sync.wait().then((res) => {
		waitFinished = true;
		return res;
	});

	assert.equal(waitFinished, false);
	sync.set();
	const res = await p;
	assert.equal(res, true);
	assert.equal(waitFinished, true);
	// Default resetOnWait: true -> should be non-signaled after waiting
	assert.equal(sync.signaled, false);
});

test("SyncObject: already signaled wait with and without resetOnWait", async () => {
	const sync = new SyncObject("mutex");
	sync.set();
	assert.equal(sync.signaled, true);

	// Wait with resetOnWait: false
	const res1 = await sync.wait({ resetOnWait: false });
	assert.equal(res1, true);
	assert.equal(sync.signaled, true);

	// Wait with resetOnWait: true
	const res2 = await sync.wait({ resetOnWait: true });
	assert.equal(res2, true);
	assert.equal(sync.signaled, false);
});

test("SyncObject: timeout handling", async () => {
	const sync = new SyncObject("timeout_test");
	const start = Date.now();
	const res = await sync.wait({ timeout: 50 });
	const elapsed = Date.now() - start;

	assert.equal(res, false);
	assert.ok(elapsed >= 40);
	assert.equal(sync.signaled, false);
});

test("SyncObject: cancelAll rejects pending waiters", async () => {
	const sync = new SyncObject("cancellable");
	const p = sync.wait();

	sync.cancelAll("Custom teardown");
	await assert.rejects(p, /Custom teardown/);
});

test("SyncObjectManager: getOrCreate, set, reset, isSignaled, clear", async () => {
	const mgr = new SyncObjectManager();
	assert.equal(mgr.isSignaled("TEST_EVENT"), false);

	mgr.set("TEST_EVENT");
	assert.equal(mgr.isSignaled("test_event"), true);

	mgr.reset("test_event");
	assert.equal(mgr.isSignaled("test_event"), false);

	let waited = false;
	const waitPromise = mgr.wait("async_event", { timeout: 1000 }).then((r) => {
		waited = true;
		return r;
	});

	mgr.set("async_event");
	const result = await waitPromise;
	assert.equal(result, true);
	assert.equal(waited, true);

	// Test clear()
	const pWait = mgr.wait("pending_obj");
	mgr.clear();
	await assert.rejects(pWait, /SyncObject cancelled/);
});

test("SyncObject: waiterCount and isWaiting telemetry", async () => {
	const sync = new SyncObject("telemetry");
	assert.equal(sync.waiterCount, 0);
	assert.equal(sync.isWaiting(), false);

	const p1 = sync.wait();
	assert.equal(sync.waiterCount, 1);
	assert.equal(sync.isWaiting(), true);

	const p2 = sync.wait();
	assert.equal(sync.waiterCount, 2);
	assert.equal(sync.isWaiting(), true);

	sync.set();
	await p1;
	// After first waiter resolves and resets signal, second waiter remains
	assert.equal(sync.waiterCount, 1);
	assert.equal(sync.isWaiting(), true);

	sync.set();
	await p2;
	assert.equal(sync.waiterCount, 0);
	assert.equal(sync.isWaiting(), false);
});

test("SyncObjectManager: has and getNames inspection", () => {
	const mgr = new SyncObjectManager();
	assert.equal(mgr.has("alpha"), false);
	assert.deepEqual(mgr.getNames(), []);

	mgr.getOrCreate("Alpha");
	assert.equal(mgr.has("alpha"), true);
	assert.equal(mgr.has("ALPHA"), true);
	assert.deepEqual(mgr.getNames(), ["alpha"]);

	mgr.set("Beta");
	assert.equal(mgr.has("beta"), true);
	assert.deepEqual(mgr.getNames().sort(), ["alpha", "beta"]);

	mgr.clear();
	assert.deepEqual(mgr.getNames(), []);
	assert.equal(mgr.has("alpha"), false);
});
