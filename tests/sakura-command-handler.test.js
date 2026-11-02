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
			appendChild(child) {
				this.children.push(child);
			},
			remove() {
				this.removed = true;
			},
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

const {
	SakuraCommandHandler,
	expandSakuraScriptEnv,
	resetScriptScopeState,
	scriptLifetimeState,
} = await import("../ui/js/ghost/sakura-command-handler.js");

test("SakuraCommandHandler covers all commands and boxes", async () => {
	const eventsSent = [];
	const mockApp = {
		toggleMenu() {
			this.menuToggled = true;
		},
		networkActions: {
			checkEmail: async () => {
				this.emailChecked = true;
			},
		},
		ghostController: {
			username: "Alice",
			currentGhost: { name: "NanaiBot" },
			sendShioriEvent: async (ev, args) => {
				eventsSent.push({ ev, args });
			},
			sendTeachInput: (val) => {
				eventsSent.push({ ev: "TeachInput", val });
			},
			clearTeachHistory: () => {},
		},
		surfaceManager: {
			bindDressup: async () => {},
			pauseAnimationById: () => {},
			resumeAnimationById: () => {},
		},
		startNetworkUpdate: async () => {
			this.updated = true;
		},
		elements: {
			balloonText: {
				appendChild(el) {
					this.child = el;
				},
			},
			keroBalloonText: { appendChild() {} },
		},
	};

	const player = { currentScope: 0, app: mockApp };
	const handler = new SakuraCommandHandler(player);

	// 1. raise command
	await handler.runCommand(["raise", "OnCustom", "arg1"]);
	assert.ok(eventsSent.some((e) => e.ev === "OnCustom"));

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

	// 6. alignmenttodesktop & alignmentondesktop
	await handler.runCommand(["set", "alignmenttodesktop", "free"]);
	await handler.runCommand(["set", "alignmenttodesktop", "bottom"]);
	await handler.runCommand(["set", "alignmentondesktop", "top"]);

	// 6b. choicetimeout / balloontimeout
	await handler.runCommand(["set", "choicetimeout", "5000"]);
	assert.equal(player.choiceTimeout, 5000);
	await handler.runCommand(["set", "balloontimeout", "3000"]);
	assert.equal(player.balloonTimeout, 3000);

	// 6c. tasktrayicon, trayballoon, biff, executesntp
	await handler.runCommand(["set", "tasktrayicon", "tray.ico"]);
	await handler.runCommand(["set", "trayballoon", "Title", "Message"]);
	await handler.runCommand(["biff"]);
	await handler.runCommand(["executesntp"]);
	assert.ok(eventsSent.some((e) => e.ev === "OnSNTPCompare"));

	// 6d. open:explorer, shellexplorer, balloonexplorer, ghostexplorer, file, browser
	await handler.runCommand(["open", "explorer"]);
	await handler.runCommand(["open", "shellexplorer"]);
	await handler.runCommand(["open", "file", "/tmp/test.txt"]);
	await handler.runCommand(["open", "browser", "https://example.com"]);

	// 7. unknown command
	await handler.runCommand(["unknown"]);

	// 8. open inputbox with OnID, --timeout, --text, --placeholder
	handler.runCommand([
		"open",
		"inputbox",
		"OnInputTest",
		"--timeout=100",
		"--text=default",
		"--placeholder=place",
	]);
	assert.ok(mockApp.elements.balloonText.child);
	// Test submit via click
	const form = mockApp.elements.balloonText.child;
	const submitBtn = form.children.find((c) => c.tagName === "BUTTON");
	submitBtn.click();
	assert.ok(eventsSent.some((e) => e.ev === "OnInputTest"));

	// 9. open inputbox with generic ID ("UserInput")
	eventsSent.length = 0;
	handler.runCommand(["open", "inputbox", "GenericID", "200", "defText"]);
	const form2 = mockApp.elements.balloonText.child;
	const input2 = form2.children.find((c) => c.tagName === "INPUT");
	input2._listeners?.keydown?.({ key: "Enter", stopPropagation() {} });
	assert.ok(eventsSent.some((e) => e.ev === "OnUserInput"));

	// 10. open teachbox and close teachbox
	eventsSent.length = 0;
	handler.openTeachBox(["teachbox", "--text=teachDefault"]);
	assert.ok(handler.teachForm);
	const teachForm = handler.teachForm;
	const teachSubmit = teachForm.children.find((c) => c.tagName === "BUTTON");
	teachSubmit.click();
	assert.ok(eventsSent.some((e) => e.ev === "TeachInput"));

	// Test teachbox escape/cancel
	handler.openTeachBox([]);
	const teachInput = handler.teachForm.children.find(
		(c) => c.tagName === "INPUT",
	);
	teachInput._listeners?.keydown?.({ key: "Escape", stopPropagation() {} });
	assert.ok(eventsSent.some((e) => e.ev === "OnTeachInputCancel"));

	// Test closeTeachBox explicitly
	handler.openTeachBox([]);
	assert.ok(handler.teachForm);
	handler.runCommand(["close", "teachbox"]);
	assert.equal(handler.teachForm, null);

	// 11. open communicatebox and close communicatebox
	eventsSent.length = 0;
	handler.runCommand([
		"open",
		"communicatebox",
		"helloWorld",
		"--timeout=150",
		"--placeholder=SaySomething",
	]);
	assert.ok(handler.communicateForm);
	const commForm = handler.communicateForm;
	const commSubmit = commForm.children.find((c) => c.tagName === "BUTTON");
	commSubmit.click();
	assert.ok(eventsSent.some((e) => e.ev === "OnCommunicate"));

	// communicatebox escape/cancel
	eventsSent.length = 0;
	handler.openCommunicateBox([]);
	const commInput = handler.communicateForm.children.find(
		(c) => c.tagName === "INPUT",
	);
	commInput._listeners?.keydown?.({ key: "Escape", stopPropagation() {} });
	assert.ok(eventsSent.some((e) => e.ev === "OnCommunicateInputCancel"));

	// close communicatebox command
	handler.openCommunicateBox([]);
	assert.ok(handler.communicateForm);
	handler.runCommand(["close", "communicatebox"]);
	assert.equal(handler.communicateForm, null);
});

test("expandSakuraScriptEnv properly resolves UKADOC/SSP variables", () => {
	const script =
		"Hello %username! I am %selfname (alias %ms, %selfname2) and partner is %keroname. Escaped: \\%username. Star: %*. Word: %m?. Prop: %property[username], %property[currentghost.name]. Screen: %screenwidthx%screenheight.";
	const expanded = expandSakuraScriptEnv(script, {
		username: "Master",
		selfname: "Nanai",
		keroname: "Kero",
		screenWidth: 1920,
		screenHeight: 1080,
		randomWords: ["TestWord"],
	});

	assert.ok(expanded.includes("Hello Master!"));
	assert.ok(expanded.includes("I am Nanai (alias Nanai, Nanai)"));
	assert.ok(expanded.includes("partner is Kero"));
	assert.ok(expanded.includes("Escaped: %username"));
	assert.ok(expanded.includes("Star: \\![*]"));
	assert.ok(expanded.includes("Word: TestWord"));
	assert.ok(expanded.includes("Prop: Master, Nanai."));
	assert.ok(expanded.includes("Screen: 1920x1080."));

	// Lifetime state testing
	scriptLifetimeState.setVariable("customVar", "ActiveValue");
	const resWithCustom = expandSakuraScriptEnv("Value: %property[customVar]");
	assert.equal(resWithCustom, "Value: ActiveValue");

	resetScriptScopeState();
	const resAfterReset = expandSakuraScriptEnv("Value: %property[customVar]");
	assert.equal(resAfterReset, "Value: ");
});
