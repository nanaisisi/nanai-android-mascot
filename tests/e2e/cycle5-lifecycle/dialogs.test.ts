import assert from "node:assert/strict";
import { test } from "vitest";
import { createMockApp, createMockElement } from "./helpers.js";

const { SakuraScriptPlayer } = await import(
	"../../../ui/js/ghost/sakura-script.js"
);
const { parseSakuraScript } = await import(
	"../../../ui/js/ghost/sakura-tokenizer.js"
);
const { ModalDialogController } = await import(
	"../../../ui/js/ui/renderers/modal-dialog-controller.js"
);

test("Cycle 5: Extended Modal Input Dialogs (dateinput, timeinput, ipinput)", async () => {
	const events: any[] = [];
	const runningAnimations = new Set<number>();
	const sakuraDisplay = createMockElement("div");
	const keroDisplay = createMockElement("div");
	const sakuraText = createMockElement("div");
	const keroText = createMockElement("div");

	const mockApp = createMockApp(
		events,
		runningAnimations,
		sakuraDisplay,
		keroDisplay,
		sakuraText,
		keroText,
	);

	const modalController = new ModalDialogController({ app: mockApp });
	mockApp.modalDialogController = modalController;

	const player = new SakuraScriptPlayer(mockApp);
	player.parse = async (script: string) => parseSakuraScript(script);
	player.sleep = () => Promise.resolve();

	// DateInput
	events.length = 0;
	const dateScript =
		"\\0\\![open,dateinput,DateID,0,2026,11,3,--reference=ref_date]\\e";
	await player.play(dateScript);

	assert.ok(
		modalController.activeBoxes.has("inputbox:DateID"),
		"dateinput should be registered in ModalDialogController",
	);
	const dateForm = sakuraText.childNodes.find((c: any) =>
		c.className?.includes("balloon-inputbox-form"),
	);
	assert.ok(dateForm, "DateInput form element must be appended");
	const dateInputEl = dateForm.children.find((c: any) => c.tagName === "INPUT");
	assert.equal(dateInputEl.value, "2026-11-03");

	// Submit DateInput
	const dateSubmitBtn = dateForm.children.find(
		(c: any) => c.tagName === "BUTTON",
	);
	dateSubmitBtn.click();
	await new Promise((r) => setTimeout(r, 10));

	assert.ok(
		events.some(
			(e) =>
				e.type === "shiori_event" &&
				e.eventName === "OnUserInput" &&
				e.args[0] === "DateID" &&
				e.args[1] === "2026,11,3" &&
				e.args[3] === "ref_date",
		),
		"DateInput should submit OnUserInput with date CSV and reference",
	);

	// TimeInput
	events.length = 0;
	const timeScript =
		"\\0\\![open,timeinput,TimeID,0,12,30,45,--reference=ref_time]\\e";
	await player.play(timeScript);

	assert.ok(
		modalController.activeBoxes.has("inputbox:TimeID"),
		"timeinput should be registered in ModalDialogController",
	);
	const timeForm = sakuraText.childNodes.find((c: any) =>
		c.className?.includes("balloon-inputbox-form"),
	);
	const timeInputEl = timeForm.children.find((c: any) => c.tagName === "INPUT");
	assert.equal(timeInputEl.value, "12:30:45");

	// Submit TimeInput
	const timeSubmitBtn = timeForm.children.find(
		(c: any) => c.tagName === "BUTTON",
	);
	timeSubmitBtn.click();
	await new Promise((r) => setTimeout(r, 10));

	assert.ok(
		events.some(
			(e) =>
				e.type === "shiori_event" &&
				e.eventName === "OnUserInput" &&
				e.args[0] === "TimeID" &&
				e.args[1] === "12,30,45" &&
				e.args[3] === "ref_time",
		),
		"TimeInput should submit OnUserInput with time CSV",
	);

	// IpInput
	events.length = 0;
	const ipScript =
		"\\0\\![open,ipinput,IpID,0,192,168,0,1,--reference=ref_ip]\\e";
	await player.play(ipScript);

	assert.ok(
		modalController.activeBoxes.has("inputbox:IpID"),
		"ipinput should be registered in ModalDialogController",
	);
	const ipForm = sakuraText.childNodes.find((c: any) =>
		c.className?.includes("balloon-inputbox-form"),
	);
	const ipInputEls = ipForm.children.filter((c: any) => c.tagName === "INPUT");
	assert.equal(ipInputEls.length, 4);
	assert.equal(ipInputEls[0].value, "192");
	assert.equal(ipInputEls[3].value, "1");

	// Submit IpInput via form Enter keydown
	ipForm._listeners?.keydown?.({ key: "Enter", stopPropagation() {} });
	await new Promise((r) => setTimeout(r, 10));

	assert.ok(
		events.some(
			(e) =>
				e.type === "shiori_event" &&
				e.eventName === "OnUserInput" &&
				e.args[0] === "IpID" &&
				e.args[1] === "192,168,0,1" &&
				e.args[3] === "ref_ip",
		),
		"IpInput should submit OnUserInput with 4-octet IP and reference",
	);

	// Close dialogs with \![close,dialog,ID]
	events.length = 0;
	modalController.openDateInput(["CloseDateID", "--option=noclose"]);
	assert.ok(modalController.activeBoxes.has("inputbox:CloseDateID"));
	await player.play("\\0\\![close,dialog,CloseDateID]\\e");
	assert.equal(
		modalController.activeBoxes.has("inputbox:CloseDateID"),
		false,
		"closeDialog should close CloseDateID",
	);
});
