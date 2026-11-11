import assert from "node:assert/strict";
import { test } from "vitest";

const { SakuraPlaybackController } = await import(
	"../ui/ts/ghost/sakura-play.js"
);

test("SakuraPlaybackController queue lifecycle, enqueue, dequeue, clearQueue and stop", async () => {
	const controller = new SakuraPlaybackController();
	const events = [];

	controller.on("queue:enqueued", (data) =>
		events.push(["enqueued", data.job.id]),
	);
	controller.on("queue:dequeued", (data) =>
		events.push(["dequeued", data.job.id]),
	);
	controller.on("queue:cleared", (data) =>
		events.push(["cleared", data.canceledCount]),
	);

	assert.equal(controller.queue.length, 0);

	let clearedCaught = false;
	const p1 = controller.enqueue("\\0テスト1\\e").catch((err) => {
		clearedCaught = err.message.includes("cleared");
	});

	assert.equal(controller.queue.length, 0); // dequeue called immediately in _processQueue
	await p1;

	controller.isProcessing = true; // simulate busy to hold items in queue
	const p2 = controller.enqueue("\\0テスト2\\e").catch((err) => {
		if (err.message.includes("cleared")) clearedCaught = true;
	});

	assert.equal(controller.queue.length, 1);
	controller.clearQueue();
	assert.equal(controller.queue.length, 0);

	await p2;
	assert.equal(clearedCaught, true);

	controller.stop();
});

test("SakuraPlaybackController event listener registration and emission", () => {
	const controller = new SakuraPlaybackController();
	let callCount = 0;
	const unbind = controller.on("test-event", (val) => {
		callCount += val;
	});

	controller.emit("test-event", 5);
	assert.equal(callCount, 5);

	unbind();
	controller.emit("test-event", 5);
	assert.equal(callCount, 5);
});

test("SakuraPlaybackController wait, quick-mode, pause, and clear notifications", () => {
	const controller = new SakuraPlaybackController();
	const events = [];

	controller.on("playback:wait", (d) => events.push(["wait", d.durationMs]));
	controller.on("playback:pause", (d) => events.push(["pause", d.noClear]));
	controller.on("playback:clear", (d) =>
		events.push(["clear", d.mode, d.count]),
	);
	controller.on("playback:quick-mode", (d) =>
		events.push(["quick", d.enabled]),
	);

	controller.notifyWait(500);
	controller.notifyPause(true);
	controller.notifyClear("char", 2);
	controller.setQuickMode(true);
	controller.setQuickMode(); // toggle

	assert.deepEqual(events, [
		["wait", 500],
		["pause", true],
		["clear", "char", 2],
		["quick", true],
		["quick", false],
	]);
});

test("SakuraPlaybackController executes jobs sequentially via mock player", async () => {
	const playedScripts = [];
	const mockPlayer = {
		play: async (script) => {
			playedScripts.push(script);
			return `done:${script}`;
		},
		skip: () => {},
	};

	const controller = new SakuraPlaybackController({ player: mockPlayer });
	assert.equal(mockPlayer.playbackController, controller);

	const res1 = await controller.enqueue("\\0Hello\\e");
	const res2 = await controller.enqueue("\\1World\\e");

	assert.equal(res1, "done:\\0Hello\\e");
	assert.equal(res2, "done:\\1World\\e");
	assert.deepEqual(playedScripts, ["\\0Hello\\e", "\\1World\\e"]);
});

test("SakuraPlaybackController pause, resume, accessors, waitMultiplier, and char/scope notifications", async () => {
	const controller = new SakuraPlaybackController();
	const events = [];

	controller.on("queue:paused", () => events.push("paused"));
	controller.on("queue:resumed", () => events.push("resumed"));
	controller.on("playback:wait-multiplier", (d) =>
		events.push(["wait-mul", d.waitMultiplier]),
	);
	controller.on("playback:char", (d) => events.push(["char", d.char, d.scope]));
	controller.on("playback:scope", (d) => events.push(["scope", d.scope]));

	assert.equal(controller.getIsPaused(), false);
	assert.equal(controller.getIsProcessing(), false);
	assert.equal(controller.getIsQuickMode(), false);
	assert.equal(controller.getQueueLength(), 0);
	assert.deepEqual(controller.getQueue(), []);
	assert.equal(controller.getCurrentJob(), null);

	controller.pause();
	assert.equal(controller.getIsPaused(), true);

	controller.setWaitMultiplier(1.5);
	assert.equal(controller.getWaitMultiplier(), 1.5);
	assert.equal(controller.calculateWait(40), 60);

	controller.setQuickMode(true);
	assert.equal(controller.calculateWait(40), 0);
	controller.setQuickMode(false);

	controller.notifyChar("あ", 0);
	controller.notifyScope(1);

	let executed = false;
	const mockPlayer = {
		play: async () => {
			executed = true;
			return "done";
		},
		skip: () => {},
	};
	controller.player = mockPlayer;

	const p = controller.enqueue("\\0テスト\\e");
	assert.equal(controller.getQueueLength(), 1);
	assert.equal(executed, false);

	controller.resume();
	assert.equal(controller.getIsPaused(), false);

	await p;
	assert.equal(executed, true);
	assert.equal(controller.getQueueLength(), 0);

	assert.deepEqual(events, [
		"paused",
		["wait-mul", 1.5],
		["char", "あ", 0],
		["scope", 1],
		"resumed",
	]);
});

test("SakuraPlaybackController setBalloonWait formats and calculateWait behavior", () => {
	const controller = new SakuraPlaybackController();
	const events = [];

	controller.on("playback:balloon-wait", (d) =>
		events.push([d.waitMultiplier, d.charWaitMs]),
	);

	// Multiplier format (e.g. 1.5)
	controller.setBalloonWait("1.5");
	assert.equal(controller.getWaitMultiplier(), 1.5);
	assert.equal(controller.calculateWait(40, true), 60);
	assert.equal(controller.calculateWait(100, false), 150);

	// Percent format (e.g. 200%)
	controller.setBalloonWait("200%");
	assert.equal(controller.getWaitMultiplier(), 2.0);
	assert.equal(controller.calculateWait(40, true), 80);

	// Millisecond format (e.g. 50ms)
	controller.setBalloonWait("50ms");
	assert.equal(controller.calculateWait(40, true), 50); // char wait fixed to 50ms
	assert.equal(controller.calculateWait(100, false), 100); // base wait uses waitMultiplier

	// 0: instant display
	controller.setBalloonWait(0);
	assert.equal(controller.calculateWait(40, true), 0);

	// Reset
	controller.resetBalloonWait();
	assert.equal(controller.getWaitMultiplier(), 1.0);
	assert.equal(controller.calculateWait(40, true), 40);

	// Quick mode overrides everything
	controller.setQuickMode(true);
	assert.equal(controller.calculateWait(40, true), 0);
});

test("SakuraPlaybackController destroy stops queue and cleans up resources", () => {
	let playerDestroyed = false;
	const mockPlayer = {
		play: async () => {},
		skip: () => {},
		destroy: () => {
			playerDestroyed = true;
		},
	};

	const controller = new SakuraPlaybackController({ player: mockPlayer });
	controller.enqueue("\\0テスト\\e").catch(() => {});

	assert.equal(controller.getQueueLength(), 0); // taken by _processQueue
	controller.destroy();

	assert.equal(playerDestroyed, true);
	assert.equal(controller.getIsPaused(), true);
	assert.equal(controller.listeners.size, 0);
});

test("SakuraPlaybackController queue inspection helpers (hasPendingJobs, getQueueSnapshot, peekNextJob)", async () => {
	const controller = new SakuraPlaybackController();

	assert.equal(controller.hasPendingJobs(), false);
	assert.equal(controller.peekNextJob(), null);
	assert.deepEqual(controller.getQueueSnapshot(), []);

	controller.isProcessing = true; // Hold queue processing
	assert.equal(controller.hasPendingJobs(), true);

	const p1 = controller.enqueue("\\0First\\e").catch(() => {});
	const p2 = controller.enqueue("\\0Second\\e").catch(() => {});

	assert.equal(controller.hasPendingJobs(), true);
	assert.equal(controller.getQueueLength(), 2);

	const peeked = controller.peekNextJob();
	assert.ok(peeked);
	assert.equal(peeked.script, "\\0First\\e");

	const snapshot = controller.getQueueSnapshot();
	assert.equal(snapshot.length, 2);
	assert.equal(snapshot[0].script, "\\0First\\e");
	assert.equal(snapshot[1].script, "\\0Second\\e");

	controller.clearQueue();
	await Promise.all([p1, p2]);

	assert.equal(controller.getQueueLength(), 0);
	assert.equal(controller.peekNextJob(), null);
	assert.deepEqual(controller.getQueueSnapshot(), []);
});
