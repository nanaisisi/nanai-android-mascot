import { describe, expect, it } from "vitest";

globalThis.window = globalThis;

import {
	handleBiffCommand,
	handleExecuteSntpCommand,
	handleOpenSystemTarget,
} from "../../ui/js/ghost/command-handler/system/target.js";

describe("system/target.js", () => {
	it("handleBiffCommand triggers email check", async () => {
		let checked = false;
		const handler = {
			app: {
				networkActions: {
					checkEmail: async () => {
						checked = true;
					},
				},
			},
		};

		await handleBiffCommand(handler, ["biff"]);
		expect(checked).toBe(true);
	});

	it("handleExecuteSntpCommand fires OnSNTPCompare", async () => {
		const events = [];
		const handler = {
			app: {
				ghostController: {
					sendShioriEvent: async (ev, args) => {
						events.push({ ev, args });
					},
				},
			},
		};

		await handleExecuteSntpCommand(handler, ["executesntp"]);
		expect(events.length).toBe(1);
		expect(events[0].ev).toBe("OnSNTPCompare");
	});

	it("handleOpenSystemTarget handles explorer, browser, and modal dialogs", async () => {
		let menuToggled = false;
		let modalShown = "";
		let openedUrl = "";

		const originalOpen = globalThis.open;
		globalThis.open = (url) => {
			openedUrl = url;
		};

		const handler = {
			app: {
				toggleMenu: () => {
					menuToggled = true;
				},
				modalManager: {
					show: (id) => {
						modalShown = id;
					},
				},
			},
		};

		try {
			await handleOpenSystemTarget(handler, ["open", "ghostexplorer"]);
			expect(menuToggled).toBe(true);

			await handleOpenSystemTarget(handler, [
				"open",
				"browser",
				"https://example.com/test",
			]);
			expect(openedUrl).toBe("https://example.com/test");

			await handleOpenSystemTarget(handler, ["open", "configurationdialog"]);
			expect(modalShown).toBe("settings-modal-content");
		} finally {
			globalThis.open = originalOpen;
		}
	});
});
