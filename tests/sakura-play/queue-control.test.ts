import assert from "node:assert/strict";
import { test } from "vitest";

const { SakuraPlaybackController } = await import(
	"../../ui/ts/ghost/sakura-play/controller.js"
);

test("SakuraPlaybackController: priority enqueue and interruption", async () => {
	const executed = [];
	let skipCalled = false;

	const mockPlayer = {
		play: async (script) => {
			executed.push(script);
			return script;
		},
		skip: () => {
			skipCalled = true;
		},
	};

	const controller = new SakuraPlaybackController({ player: mockPlayer });
	assert.equal(controller.player, mockPlayer);

	// Enqueue standard jobs
	const p1 = controller.enqueue("\\0First\\e");
	const p2 = controller.enqueue("\\0Second\\e");

	// Priority enqueue should insert at front of remaining queue
	const pPriority = controller.enqueuePriority("\\0Urgent\\e");

	await Promise.all([p1, p2, pPriority]);
	assert.deepEqual(executed, ["\\0First\\e", "\\0Urgent\\e", "\\0Second\\e"]);

	// Test interrupt
	executed.length = 0;
	skipCalled = false;
	const pInt = controller.interrupt("\\0Interrupting\\e");
	await pInt;

	assert.equal(skipCalled, true);
	assert.deepEqual(executed, ["\\0Interrupting\\e"]);
});

test("SakuraPlaybackController: getStatus telemetry", async () => {
	const controller = new SakuraPlaybackController();
	controller.setWaitMultiplier(1.5);

	const status = controller.getStatus();
	assert.equal(status.isProcessing, false);
	assert.equal(status.isPaused, false);
	assert.equal(status.isQuickMode, false);
	assert.equal(status.queueLength, 0);
	assert.equal(status.currentJobId, null);
	assert.equal(status.waitMultiplier, 1.5);
	assert.equal(status.charWaitMs, null);

	controller.pause();
	assert.equal(controller.getStatus().isPaused, true);
	controller.resume();
	assert.equal(controller.getStatus().isPaused, false);
});

test("SakuraPlaybackController: queue clear rejects all pending jobs", async () => {
	let resolvePlay = null;
	const mockPlayer = {
		play: () =>
			new Promise((resolve) => {
				resolvePlay = resolve;
			}),
		skip: () => {},
	};

	const controller = new SakuraPlaybackController({ player: mockPlayer });
	const p1 = controller.enqueue("\\0Job1\\e");
	const p2 = controller.enqueue("\\0Job2\\e");
	const p3 = controller.enqueue("\\0Job3\\e");

	// While p1 is processing, clear queue
	controller.clearQueue();

	await assert.rejects(p2, /Playback queue cleared/);
	await assert.rejects(p3, /Playback queue cleared/);

	// Complete p1 normally
	resolvePlay("done");
	const res1 = await p1;
	assert.equal(res1, "done");
});
