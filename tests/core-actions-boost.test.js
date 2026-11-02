import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { BalloonThemeManager } from "../ui/js/core/actions/balloon-theme.js";
import { ghostActions } from "../ui/js/core/actions/ghost-actions.js";

describe("Ghost Actions and Balloon Theme Coverage Boost", () => {
	it("ghostActions covers uninstallCurrentGhost, installGhostFromMenu, and scale commands", async () => {
		let _shownBalloon = null;
		let selectedGhost = null;
		let _scannedGhosts = false;
		let scannedBalloons = false;

		const app = {
			elements: {
				ghostDisplay: { style: {} },
			},
			showBalloon: (msg) => {
				_shownBalloon = msg;
			},
			hideBalloon: () => {},
			hideMenu: () => {},
			modalManager: {
				showNotification: () => {},
			},
			ghostController: {
				currentGhost: { name: "CurrentGhost" },
				ghosts: [{ name: "NextGhost" }],
				selectGhost: async (name) => {
					selectedGhost = name;
				},
				scanGhosts: async () => {
					_scannedGhosts = true;
				},
				sendShioriEvent: () => {},
			},
			scanBalloons: async () => {
				scannedBalloons = true;
			},
			availableBalloons: [{ name: "ImportedBalloon", dir_name: "imp_balloon" }],
			setBalloonTheme: async () => {},
			surfaceManager: {
				categories: [
					{
						category: "costume",
						parts: [{ part: "dress1" }, { part: "dress2" }],
					},
				],
				bindDressup: async () => {},
			},
		};

		Object.assign(app, ghostActions);

		// uninstallCurrentGhost success with next ghost
		globalThis.window = globalThis;
		globalThis.document = {
			documentElement: {
				style: {
					removeProperty: () => {},
					setProperty: () => {},
				},
				setAttribute: () => {},
			},
			querySelector: () => ({ style: {} }),
		};
		globalThis.__TAURI_INTERNALS__ = {
			invoke: async (cmd, _args) => {
				if (cmd === "uninstall_ghost") return true;
				if (cmd === "pick_and_install_ghost_archive")
					return { name: "ImportedBalloon" };
				if (cmd === "set_character_scale") return;
				if (cmd === "minimize_app") return;
				return null;
			},
		};

		await app.uninstallCurrentGhost();
		assert.equal(selectedGhost, "NextGhost");

		// installGhostFromMenu success
		await app.installGhostFromMenu();
		assert.equal(scannedBalloons, true);

		// applyShellScaleAction and minimize
		await app.applyShellScaleAction("1.5");
		await app.minimizeApp();
	});

	it("BalloonThemeManager covers scanBalloons and manifest apply", async () => {
		let appliedProps = null;
		const app = {
			applyBalloonDescript: (props) => {
				appliedProps = props;
			},
			hideBalloon: () => {},
		};

		const docMock = {
			documentElement: {
				style: {
					removeProperty: () => {},
					setProperty: () => {},
				},
				setAttribute: () => {},
			},
			querySelector: () => ({ style: {} }),
		};
		globalThis.window = globalThis;
		globalThis.document = docMock;

		globalThis.__TAURI_INTERNALS__ = {
			invoke: async (cmd, _args) => {
				if (cmd === "balloon_manifest") return { "origin.x": 10 };
				if (cmd === "scan_balloons") return [{ name: "B1", dir_name: "b1" }];
				return null;
			},
		};

		const btm = new BalloonThemeManager(app);
		await btm.scanBalloons();
		assert.equal(btm.availableBalloons.length, 1);

		await btm.setTheme("B1");
		assert.deepEqual(appliedProps, { "origin.x": 10 });
	});
});
