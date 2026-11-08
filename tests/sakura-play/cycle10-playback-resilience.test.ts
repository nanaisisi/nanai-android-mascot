import assert from "node:assert/strict";
import { test } from "vitest";
import { SakuraPlaybackController } from "../../ui/ts/ghost/sakura-play/controller.js";
import {
	SyncObject,
	SyncObjectManager,
} from "../../ui/ts/ghost/sakura-play/sync-object.js";

test("SyncObject: pulse and setAll broadcast to multiple waiters", async () => {
	const sync = new SyncObject("broadcast");
	let w1Finished = false;
	let w2Finished = false;
	let w3Finished = false;

	const p1 = sync.wait().then((res) => {
		w1Finished = true;
		return res;
	});
	const p2 = sync.wait().then((res) => {
		w2Finished = true;
		return res;
	});
	const p3 = sync.wait().then((res) => {
		w3Finished = true;
		return res;
	});

	assert.equal(sync.waiterCount, 3);
	assert.equal(sync.isWaiting(), true);

	// pulse(true) should resolve all waiters and reset signaled state
	sync.pulse(true);

	const [r1, r2, r3] = await Promise.all([p1, p2, p3]);
	assert.equal(r1, true);
	assert.equal(r2, true);
	assert.equal(r3, true);
	assert.equal(w1Finished, true);
	assert.equal(w2Finished, true);
	assert.equal(w3Finished, true);
	assert.equal(sync.signaled, false);
	assert.equal(sync.waiterCount, 0);

	// setAll should resolve all waiters and keep signaled state
	const p4 = sync.wait();
	sync.setAll();
	assert.equal(await p4, true);
	assert.equal(sync.signaled, true);
});

test("SyncObjectManager: pulse, setAll, get and getAllInfo", async () => {
	const mgr = new SyncObjectManager();
	mgr.getOrCreate("event_A");
	mgr.getOrCreate("event_B");

	const pA1 = mgr.wait("event_A");
	const pA2 = mgr.wait("event_A");

	const infoBefore = mgr.getAllInfo();
	assert.equal(infoBefore.length, 2);
	const itemA = infoBefore.find((i) => i.name === "event_a");
	assert.ok(itemA);
	assert.equal(itemA.waiterCount, 2);
	assert.equal(itemA.signaled, false);

	mgr.pulse("event_A", true);
	const [rA1, rA2] = await Promise.all([pA1, pA2]);
	assert.equal(rA1, true);
	assert.equal(rA2, true);

	const objA = mgr.get("event_a");
	assert.ok(objA);
	assert.equal(objA.waiterCount, 0);
	assert.equal(objA.signaled, false);

	mgr.setAll("event_B");
	assert.equal(mgr.isSignaled("event_B"), true);
});

test("SakuraPlaybackController: getJobById, cancelJob in queue and active job", async () => {
	let skipped = false;
	const mockPlayer = {
		play: async () => {
			await new Promise((r) => setTimeout(r, 80));
			return "done";
		},
		skip: () => {
			skipped = true;
		},
	};

	const controller = new SakuraPlaybackController({ player: mockPlayer });
	controller.pause(); // Hold processing to inspect queue

	const p1 = controller.enqueue("\\0Hello 1");
	const p2 = controller.enqueue("\\0Hello 2");
	const p3 = controller.enqueue("\\0Hello 3");

	assert.equal(controller.getQueueLength(), 3);

	const job2 = controller.getJobById(2);
	assert.ok(job2);
	assert.equal(job2.script, "\\0Hello 2");

	// Cancel job2
	const cancelled = controller.cancelJob(2, "Test cancellation");
	assert.equal(cancelled, true);
	assert.equal(controller.getQueueLength(), 2);

	await assert.rejects(p2, /Test cancellation/);

	// Try cancelling non-existent job
	assert.equal(controller.cancelJob(999), false);

	// Resume processing
	controller.resume();
	assert.ok(controller.getCurrentJob());

	// Cancel currently running job
	const currentJobId = controller.getCurrentJob()?.id;
	if (currentJobId) {
		const cancelledCurrent = controller.cancelJob(currentJobId, "Skip running");
		assert.equal(cancelledCurrent, true);
		assert.equal(skipped, true);
	}

	await Promise.allSettled([p1, p3]);
});

test("SakuraPlaybackController: filterQueue removes non-matching jobs", async () => {
	const controller = new SakuraPlaybackController();
	controller.pause();

	const p1 = controller.enqueue("\\0Keep this");
	const p2 = controller.enqueue("\\0Drop this");
	const p3 = controller.enqueue("\\0Keep this too");

	assert.equal(controller.getQueueLength(), 3);

	const removedCount = controller.filterQueue((job) =>
		job.script.includes("Keep"),
	);
	assert.equal(removedCount, 1);
	assert.equal(controller.getQueueLength(), 2);

	await assert.rejects(p2, /Filtered out of queue/);

	controller.clearQueue();
	await assert.rejects(p1, /Playback queue cleared/);
	await assert.rejects(p3, /Playback queue cleared/);
});

test("SakuraPlaybackController: pause duration telemetry in getStatus and queue:resumed", async () => {
	const controller = new SakuraPlaybackController();
	assert.equal(controller.getIsPaused(), false);

	let resumePayload: { pausedDurationMs?: number } | null = null;
	controller.on("queue:resumed", (data) => {
		resumePayload = data as { pausedDurationMs?: number };
	});

	controller.pause();
	assert.equal(controller.getIsPaused(), true);

	await new Promise((r) => setTimeout(r, 20));

	const status = controller.getStatus();
	assert.equal(status.isPaused, true);
	assert.ok(status.pausedDurationMs >= 15);

	controller.resume();
	assert.equal(controller.getIsPaused(), false);
	assert.ok(resumePayload);
	assert.ok(
		(resumePayload as { pausedDurationMs: number }).pausedDurationMs >= 15,
	);
});
