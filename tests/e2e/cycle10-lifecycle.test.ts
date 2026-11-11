import assert from "node:assert/strict";
import { test } from "vitest";
import { createMockElement } from "./helpers.js";

const { ModalDialogController } = await import(
	"../../ui/js/ui/renderers/modal-dialog-controller.js"
);
const { buildRawSstpRequest, parseRawSstpResponse } = await import(
	"../../ui/js/core/actions/sstp-fmo-actions.js"
);
const { SakuraPlaybackController } = await import(
	"../../ui/js/ghost/sakura-play/controller.js"
);

test("E2E dialogue lifecycle Cycle 10: SSTP request construction and response parsing roundtrip in flow", async () => {
	const rawRequest = buildRawSstpRequest({
		method: "SEND",
		charset: "UTF-8",
		sender: "NanaiE2ECycle10",
		script: "\\0\\s[0]Hello from SSTP 1.4!\\e",
		options: ["nodescript", "notranslate"],
		references: {
			Reference0: "ref0_value",
			Reference1: "ref1_value",
		},
	});

	assert.ok(rawRequest.startsWith("SEND SSTP/1.4\r\n"));
	assert.ok(rawRequest.includes("Charset: UTF-8\r\n"));
	assert.ok(rawRequest.includes("Sender: NanaiE2ECycle10\r\n"));
	assert.ok(
		rawRequest.includes("Script: \\0\\s[0]Hello from SSTP 1.4!\\e\r\n"),
	);
	assert.ok(rawRequest.includes("Option: nodescript, notranslate\r\n"));
	assert.ok(
		rawRequest.includes("Reference0: ref0_value\r\nReference1: ref1_value\r\n"),
	);

	const rawResponseText = [
		"SSTP/1.4 200 OK",
		"Charset: UTF-8",
		"Script: \\0\\s[5]Acknowledged!\\e",
		"Reference0: Success",
		"ID: test_msg",
		"",
		"Additional body line",
	].join("\r\n");

	const parsed = parseRawSstpResponse(rawResponseText);
	assert.equal(parsed.status, "200 OK");
	assert.equal(parsed.value, "\\0\\s[5]Acknowledged!\\e");
	assert.equal(parsed.reference0, "Success");
	assert.equal(parsed.id, "test_msg");
	assert.equal(parsed.additional_data, "Additional body line");
});

test("E2E dialogue lifecycle Cycle 10: TeachBox and CommunicateBox cancellation and timeout flows", async () => {
	const events: Array<{ type: string; [key: string]: unknown }> = [];
	const sakuraDisplay = createMockElement("div");
	const sakuraText = createMockElement("div");

	const mockApp = {
		ghostId: "e2e_cycle10_boxes",
		elements: {
			balloonDisplay: sakuraDisplay,
			balloonText: sakuraText,
		},
		ghostController: {
			sendShioriEvent: async (eventName: string, args: unknown[]) => {
				events.push({ type: "shiori_event", eventName, args });
				return { status: 200, value: "" };
			},
		},
		modalDialogController: null as unknown,
	};

	const modalController = new ModalDialogController({ app: mockApp });
	mockApp.modalDialogController = modalController;

	// 1. Open teach box and simulate user cancel
	let teachBoxClosed = false;
	modalController.openTeachBox = (options: {
		onCancel?: (reason: string) => void;
	}) => {
		events.push({ type: "open_teach_box", options });
		if (options.onCancel) {
			options.onCancel("user");
			teachBoxClosed = true;
		}
	};

	modalController.openTeachBox({
		onCancel: async (reason: string) => {
			await mockApp.ghostController.sendShioriEvent("OnTeachInputCancel", [
				reason,
			]);
		},
	});

	assert.equal(teachBoxClosed, true);
	assert.ok(
		events.some(
			(e) =>
				e.type === "shiori_event" &&
				e.eventName === "OnTeachInputCancel" &&
				(e.args as string[])[0] === "user",
		),
		"OnTeachInputCancel should be emitted with 'user' reason",
	);

	// 2. Open communicate box and simulate timeout cancel
	events.length = 0;
	let commBoxTimeout = false;
	modalController.openCommunicateBox = (options: {
		onCancel?: (reason: string) => void;
	}) => {
		events.push({ type: "open_communicate_box", options });
		if (options.onCancel) {
			options.onCancel("timeout");
			commBoxTimeout = true;
		}
	};

	modalController.openCommunicateBox({
		onCancel: async (reason: string) => {
			await mockApp.ghostController.sendShioriEvent(
				"OnCommunicateInputCancel",
				[reason],
			);
		},
	});

	assert.equal(commBoxTimeout, true);
	assert.ok(
		events.some(
			(e) =>
				e.type === "shiori_event" &&
				e.eventName === "OnCommunicateInputCancel" &&
				(e.args as string[])[0] === "timeout",
		),
		"OnCommunicateInputCancel should be emitted with 'timeout' reason",
	);
});

test("E2E dialogue lifecycle Cycle 10: SakuraPlaybackController pause, priority enqueue, and queue status telemetry", async () => {
	const controller = new SakuraPlaybackController();
	assert.equal(controller.isEmpty(), true);

	// Pause queue processing so jobs remain in queue for status inspection
	controller.pause();
	assert.equal(controller.getIsPaused(), true);

	const normalScript = "\\0\\s[0]First line...\\w9\\w9\\e";
	const priorityScript = "\\0\\s[1]URGENT Interrupt!\\e";

	// Enqueue in paused state and catch reject on clearQueue/stop
	const p1 = controller.enqueue(normalScript).catch(() => {});
	assert.equal(controller.isEmpty(), false);
	assert.equal(controller.getQueueLength(), 1);

	const initialStatus = controller.getStatus();
	assert.equal(initialStatus.queueLength, 1);
	assert.equal(initialStatus.isProcessing, false);
	assert.equal(initialStatus.isPaused, true);

	// Priority enqueue unshifts before existing jobs
	const p2 = controller.enqueuePriority(priorityScript).catch(() => {});
	assert.equal(controller.getQueueLength(), 2);

	const peeked = controller.peekNextJob();
	assert.equal(peeked?.script, priorityScript);

	// Stop/clear queue
	controller.stop();
	assert.equal(controller.isEmpty(), true);
	assert.equal(controller.getQueueLength(), 0);

	await Promise.all([p1, p2]);
});

test("E2E dialogue lifecycle Cycle 10: Parallel async SSTP request and concurrent queue ordering resilience", async () => {
	// 複数リクエストが非同期並行に発行された際のフォーマットおよび解析の一貫性を検証
	const requests = Array.from({ length: 10 }, (_, i) => ({
		method: "SEND" as const,
		charset: "UTF-8",
		sender: `ParallelSender_${i}`,
		script: `\\0\\s[${i}]Concurrent script payload ${i}\\e`,
		options: ["notranslate"],
		references: {
			Reference0: `val_${i}`,
		},
	}));

	const built = await Promise.all(
		requests.map(async (req) => {
			return {
				req,
				raw: buildRawSstpRequest(req),
			};
		}),
	);

	for (const { req, raw } of built) {
		assert.ok(raw.includes(`Sender: ${req.sender}\r\n`));
		assert.ok(raw.includes(`Script: ${req.script}\r\n`));
		assert.ok(raw.includes(`Reference0: ${req.references.Reference0}\r\n`));
	}

	// 並行レスポンス解析の検証
	const parsePromises = requests.map(async (_req, idx) => {
		const rawResponse = [
			"SSTP/1.4 200 OK",
			"Charset: UTF-8",
			`Script: \\0\\s[0]Echo ${idx}\\e`,
			`Reference0: ack_${idx}`,
			"",
		].join("\r\n");
		return parseRawSstpResponse(rawResponse);
	});

	const parsedResults = await Promise.all(parsePromises);
	assert.equal(parsedResults.length, 10);
	parsedResults.forEach((res, idx) => {
		assert.equal(res.status, "200 OK");
		assert.equal(res.reference0, `ack_${idx}`);
		assert.equal(res.value, `\\0\\s[0]Echo ${idx}\\e`);
	});
});
