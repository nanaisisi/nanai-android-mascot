import assert from "node:assert/strict";
import { test } from "vitest";

globalThis.window = globalThis;
globalThis.document = {
	createElement: () => ({
		textContent: "",
		style: {},
		classList: { remove() {} },
	}),
};

const { actionMethods } = await import("../ui/js/core/app-actions.js");

test("actionMethods.handleMenuAction covers all branches", async () => {
	const mockApp = {
		ghostController: {
			currentGhost: { name: "Mock", isTemporary: true },
			selectGhost: async () => {},
			selectShell: async () => {},
			sendShioriEvent: () => {},
			scanGhosts: async () => {},
		},
		modalManager: { show() {} },
		elements: { ghostDisplay: { style: {}, classList: { remove() {} } } },
		interactionManager: { balloonOffsetX: 0, balloonOffsetY: 0 },
		showBalloon() {},
		hideBalloon() {},
		startNetworkUpdate: async () => {},
		showGhostInformation: async () => {},
		uninstallCurrentGhost: async () => {},
		installGhostFromMenu: async () => {},
		cycleBalloonTheme: async () => {},
		setBalloonTheme() {},
		applyShellScaleAction() {},
		applyBalloonScaleAction() {},
		closeApp() {},
		minimizeApp() {},
		callGhost: async () => {},
		handleDressupToggle: async () => {},
		onGhostClick() {
			return "talk-result";
		},
		checkEmail: async () => {},
	};

	// Bind mockApp to actionMethods
	const handle = actionMethods.handleMenuAction.bind(mockApp);

	assert.equal(handle("talk", { scope: 1 }), "talk-result");
	assert.equal(handle("talk"), "talk-result");
	await handle("update");
	await handle("updatecheck");
	await handle("ghost-info");
	assert.equal(handle("explorer"), undefined);
	assert.equal(handle("backlog"), undefined);

	await handle("reload-ghost");
	handle("reset-shell-position");
	handle("reset-balloon-position");
	handle("close-balloon");
	handle("keep-temporary-ghost");

	mockApp.ghostController.currentGhost.isTemporary = false;
	handle("keep-temporary-ghost");

	await handle("biff");
	handle("recommend");
	await handle("scan");
	handle("open-ghost-folder");
	await handle("uninstall");
	handle("install");
	handle("balloon-theme-ivory");
	handle("balloon-theme-custom");
	handle("scale-100");
	handle("balloon-scale-100");
	handle("close");
	handle("close-menu");
	handle("minimize");

	await handle("switch-to-ghost", "TestGhost");
	await handle("switch-ghost", { name: "TestGhost2" });
	await handle("call-ghost", "TestGhost");
	await handle("recent-ghost", { ghostName: "TestGhost" });
	await handle("switch-to-shell", "Default");
	await handle("dressup-toggle", { part: "hat" });
	handle("unknown-action");
});
