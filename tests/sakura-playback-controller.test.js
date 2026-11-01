import assert from "node:assert/strict";
import { test } from "vitest";

const { SakuraPlaybackController } = await import(
	"../ui/js/ghost/sakura-play.js"
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

	const res1 = await controller.enqueue("\\0Hello\\e");
	const res2 = await controller.enqueue("\\1World\\e");

	assert.equal(res1, "done:\\0Hello\\e");
	assert.equal(res2, "done:\\1World\\e");
	assert.deepEqual(playedScripts, ["\\0Hello\\e", "\\1World\\e"]);
});
