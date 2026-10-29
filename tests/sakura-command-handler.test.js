import assert from "node:assert/strict";
import { test } from "vitest";

globalThis.window = globalThis;
globalThis.document = {
	createElement(tag) {
		const el = {
			tagName: tag.toUpperCase(),
			style: {},
			className: "",
			children: [],
			appendChild(child) { this.children.push(child); },
			remove() { this.removed = true; },
			addEventListener(type, cb) {
				this._listeners = this._listeners || {};
				this._listeners[type] = cb;
			},
			click() {
				this._listeners?.click?.({ stopPropagation() {} });
			},
			focus() {},
		};
		if (tag === "input") {
			el.value = "";
		}
		return el;
	},
};

const { SakuraCommandHandler } = await import("../ui/js/ghost/sakura-command-handler.js");

test("SakuraCommandHandler covers all commands and boxes", async () => {
	const eventsSent = [];
	const mockApp = {
		toggleMenu() { this.menuToggled = true; },
		ghostController: {
			sendShioriEvent: async (ev, args) => { eventsSent.push({ ev, args }); },
			sendTeachInput: (val) => { eventsSent.push({ ev: "TeachInput", val }); },
			clearTeachHistory: () => {},
		},
		surfaceManager: {
			bindDressup: async () => {},
			pauseAnimationById: () => {},
			resumeAnimationById: () => {},
		},
		startNetworkUpdate: async () => { this.updated = true; },
		elements: {
			balloonText: { appendChild(el) { this.child = el; } },
			keroBalloonText: { appendChild() {} },
		},
	};

	const player = { currentScope: 0, app: mockApp };
	const handler = new SakuraCommandHandler(player);

	// 1. raise command
	await handler.runCommand(["raise", "OnCustom", "arg1"]);
	assert.ok(eventsSent.some(e => e.ev === "OnCustom"));

	// 2. bind and bind-noevent
	await handler.runCommand(["bind", "hat", "ribbon", "1"]);
	await handler.runCommand(["bind-noevent", "hat", "ribbon", "0"]);

	// 3. anim (pause / pouse / resume)
	await handler.runCommand(["anim", "pause", "10"]);
	await handler.runCommand(["anim", "pouse", "10"]);
	await handler.runCommand(["anim", "resume", "10"]);
	await handler.runCommand(["anim", "invalid", "notanumber"]);

	// 4. dressupexplorer
	await handler.runCommand(["open", "dressupexplorer"]);
	assert.equal(mockApp.menuToggled, true);

	// 5. update / updatebymyself
	await handler.runCommand(["update"]);
	await handler.runCommand(["updatebymyself"]);

	// 6. alignmenttodesktop
	await handler.runCommand(["set", "alignmenttodesktop", "free"]);
	await handler.runCommand(["set", "alignmenttodesktop", "bottom"]);

	// 7. unknown command
	await handler.runCommand(["unknown"]);

	// 8. open inputbox with OnID, --timeout, --text, --placeholder
	handler.runCommand(["open", "inputbox", "OnInputTest", "--timeout=100", "--text=default", "--placeholder=place"]);
	assert.ok(mockApp.elements.balloonText.child);
	// Test submit via click
	const form = mockApp.elements.balloonText.child;
	const submitBtn = form.children.find(c => c.tagName === "BUTTON");
	submitBtn.click();
	assert.ok(eventsSent.some(e => e.ev === "OnInputTest"));

	// 9. open inputbox with generic ID ("UserInput")
	eventsSent.length = 0;
	handler.runCommand(["open", "inputbox", "GenericID", "200", "defText"]);
	const form2 = mockApp.elements.balloonText.child;
	const input2 = form2.children.find(c => c.tagName === "INPUT");
	input2._listeners?.keydown?.({ key: "Enter", stopPropagation() {} });
	assert.ok(eventsSent.some(e => e.ev === "OnUserInput"));

	// 10. open teachbox and close teachbox
	eventsSent.length = 0;
	handler.openTeachBox(["teachbox", "--text=teachDefault"]);
	assert.ok(handler.teachForm);
	const teachForm = handler.teachForm;
	const teachSubmit = teachForm.children.find(c => c.tagName === "BUTTON");
	teachSubmit.click();
	assert.ok(eventsSent.some(e => e.ev === "TeachInput"));

	// Test teachbox escape/cancel
	handler.openTeachBox([]);
	const teachInput = handler.teachForm.children.find(c => c.tagName === "INPUT");
	teachInput._listeners?.keydown?.({ key: "Escape", stopPropagation() {} });
	assert.ok(eventsSent.some(e => e.ev === "OnTeachInputCancel"));

	// Test closeTeachBox explicitly
	handler.openTeachBox([]);
	assert.ok(handler.teachForm);
	handler.runCommand(["close", "teachbox"]);
	assert.equal(handler.teachForm, null);
});
