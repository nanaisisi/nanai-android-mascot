import assert from "node:assert/strict";
import { test } from "vitest";
import { SakuraPlaybackController } from "../../ui/ts/ghost/sakura-play/controller.js";
import { SyncObjectManager } from "../../ui/ts/ghost/sakura-play/sync-object.js";
import { playScript } from "../../ui/ts/ghost/sakura-play.js";
import { createEl } from "./helpers.js";

test("playScript: inline choice scope (\\__q[ID,...]...\\__q) click and event handlers", async () => {
	const sakuraText = createEl("div");
	const sentEvents: Array<{ event: string; args: unknown[] }> = [];

	let choiceHandlerCalled = false;
	const player = {
		playbackId: 100,
		isSyncMode: false,
		parse: async () => [
			{ type: "scope", value: 0 },
			{ type: "choice_scope_begin", id: "inline_opt1", args: ["ref1"] },
			{ type: "char", value: "選" },
			{ type: "char", value: "択" },
			{ type: "choice_scope_end" },
		],
		sleep: () => Promise.resolve(),
		waitForClickOrTimeout: () => Promise.resolve(),
		onChoiceSelected: (id: string, text: string, args: string[]) => {
			choiceHandlerCalled = true;
			assert.equal(id, "inline_opt1");
			assert.equal(text, "選択");
			assert.deepEqual(args, ["ref1"]);
		},
		onChoiceTimeout: () => {},
		scheduleSurfaceRestore: () => {},
		app: {
			ghostId: "main",
			currentBalloonTheme: "default",
			elements: {
				balloonText: sakuraText,
				balloonDisplay: createEl("div"),
			},
			surfaceManager: {
				onCharSpoken() {},
				onTalkEnd() {},
				onScriptEnd() {},
			},
			ghostController: {
				updateSurface() {},
				sendShioriEvent: async (event: string, args: unknown[]) => {
					sentEvents.push({ event, args });
					return null;
				},
			},
		},
	};

	await playScript(player, "\\__q[inline_opt1,ref1]選択\\__q");

	// Inline choice element is rendered inside balloon text
	const inlineSpan = sakuraText.children.find((c: unknown) =>
		(c as { className?: string }).className?.includes("balloon-choice-inline"),
	) as
		| { textContent?: string; "data-choice-id"?: string; click: () => void }
		| undefined;
	assert.ok(inlineSpan);
	assert.equal(inlineSpan.textContent, "選択");
	assert.equal(inlineSpan["data-choice-id"], "inline_opt1");

	// Trigger click on inline choice
	inlineSpan.click();
	assert.equal(choiceHandlerCalled, true);
});

test("playScript: multi-scope sync speech (\\_s[0,1]) mirrors to specified scopes", async () => {
	const sakuraText = createEl("div");
	const keroText = createEl("div");
	const spokenScopes: number[] = [];

	const player = {
		playbackId: 200,
		isSyncMode: false,
		parse: async () => [
			{ type: "scope", value: 0 },
			{ type: "sync_toggle", value: true, scopes: [0, 1] },
			{ type: "char", value: "A" },
			{ type: "newline", half: false },
			{ type: "char", value: "B" },
			{ type: "sync_toggle", value: false, scopes: [] },
			{ type: "char", value: "C" },
		],
		sleep: () => Promise.resolve(),
		waitForClickOrTimeout: () => Promise.resolve(),
		onChoiceSelected: () => {},
		onChoiceTimeout: () => {},
		scheduleSurfaceRestore: () => {},
		app: {
			ghostId: "main",
			currentBalloonTheme: "default",
			elements: {
				balloonText: sakuraText,
				balloonDisplay: createEl("div"),
				keroBalloonText: keroText,
				keroBalloonDisplay: createEl("div"),
			},
			surfaceManager: {
				onCharSpoken(scope: number) {
					spokenScopes.push(scope);
				},
				onTalkEnd() {},
				onScriptEnd() {},
			},
			ghostController: {
				updateSurface() {},
				sendShioriEvent: async () => {},
			},
		},
	};

	await playScript(player, "\\_s[0,1]A\\nB\\_sC");

	assert.equal(sakuraText.textContent, "ABC");
	assert.equal(keroText.textContent, "AB");
	assert.ok(spokenScopes.includes(0));
	assert.ok(spokenScopes.includes(1));
});

test("SakuraPlaybackController: enqueueMany, findJobs, retryJob, and processedCount", async () => {
	const executedScripts: string[] = [];
	const mockPlayer = {
		play: async (script: string) => {
			executedScripts.push(script);
			return `res:${script}`;
		},
		skip: () => {},
	};

	const controller = new SakuraPlaybackController({ player: mockPlayer });
	controller.pause();

	const resultsPromise = controller.enqueueMany([
		"\\0Job 1\\e",
		"\\0Job 2\\e",
		"\\0Special Job 3\\e",
	]);

	assert.equal(controller.getQueueLength(), 3);

	// findJobs test
	const matchingJobs = controller.findJobs((job) =>
		job.script.includes("Special"),
	);
	assert.equal(matchingJobs.length, 1);
	assert.equal(matchingJobs[0].script, "\\0Special Job 3\\e");

	// retryJob creates a priority job with identical script
	const retryPromise = controller.retryJob(matchingJobs[0].id);
	assert.ok(retryPromise);
	assert.equal(controller.getQueueLength(), 4);
	assert.equal(controller.peekNextJob()?.script, "\\0Special Job 3\\e");

	controller.resume();
	await Promise.all([resultsPromise, retryPromise]);

	assert.equal(controller.getStatus().processedCount, 4);
	assert.equal(executedScripts[0], "\\0Special Job 3\\e"); // Priority retry executed first
});

test("SyncObject & SyncObjectManager: hasWaiters, resetAll, remove, size", async () => {
	const mgr = new SyncObjectManager();
	assert.equal(mgr.size(), 0);

	const objA = mgr.getOrCreate("event_A");
	const objB = mgr.getOrCreate("event_B");
	assert.equal(mgr.size(), 2);

	assert.equal(objA.hasWaiters(), false);
	const waitPromise = objA.wait();
	assert.equal(objA.hasWaiters(), true);

	objA.set();
	assert.equal(await waitPromise, true);
	assert.equal(objA.hasWaiters(), false);

	objB.set();
	assert.equal(objB.signaled, true);
	mgr.resetAll();
	assert.equal(objB.signaled, false);

	// Remove object
	const removed = mgr.remove("event_a");
	assert.equal(removed, true);
	assert.equal(mgr.size(), 1);
	assert.equal(mgr.has("event_a"), false);
	assert.equal(mgr.remove("non_existent"), false);
});
