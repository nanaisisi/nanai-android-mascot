import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
	checkBaseWareMutex,
	filterActiveGhosts,
	filterVisibleGhosts,
	getFmoStatus,
	updateFmoBalloonText,
	updateFmoLifecycleState,
	updateFmoSurfaces,
} from "../../ui/ts/core/actions/sstp-fmo-actions.js";
import { mockInvoke, setupTauriMock, teardownTauriMock } from "./helpers.js";

describe("FMO frontend actions & Mutex checks (Slot-01)", () => {
	beforeEach(() => {
		setupTauriMock();
		mockInvoke.mockReset();
	});

	afterEach(() => {
		teardownTauriMock();
	});

	it("getFmoStatus parses JSON status correctly", async () => {
		const mockFmo = {
			ghosts: {
				"0": {
					name: "Nanai",
					keroname: "Kero",
					surface0: 0,
					surface1: 10,
					balloon0: "Hello",
					balloon1: "",
					path: "/nanai",
					is_visible: true,
					lifecycle_state: "active",
				},
			},
			hwnd: 12345,
			craftman: "Nanai Project",
		};
		mockInvoke.mockResolvedValueOnce(JSON.stringify(mockFmo));

		const status = await getFmoStatus();
		expect(mockInvoke).toHaveBeenCalledWith("get_fmo_status", {});
		expect(status).toEqual(mockFmo);
	});

	it("getFmoStatus returns fallback on JSON parse failure", async () => {
		mockInvoke.mockResolvedValueOnce("invalid json");

		const status = await getFmoStatus();
		expect(status).toEqual({
			ghosts: {},
			hwnd: 0,
			craftman: "",
		});
	});

	it("updateFmoBalloonText updates balloon text and parses response", async () => {
		const mockFmo = {
			ghosts: {
				"0": {
					name: "Nanai",
					balloon0: "Updated Text",
					balloon1: "",
				},
			},
			hwnd: 0,
			craftman: "Nanai Project",
		};
		mockInvoke.mockResolvedValueOnce(JSON.stringify(mockFmo));

		const res = await updateFmoBalloonText("Updated Text", "");
		expect(mockInvoke).toHaveBeenCalledWith("update_fmo_balloon_text", {
			balloon0: "Updated Text",
			balloon1: "",
		});
		expect(res.ghosts["0"].balloon0).toBe("Updated Text");
	});

	it("updateFmoSurfaces updates surface indices and parses response", async () => {
		const mockFmo = {
			ghosts: {
				"0": {
					name: "Nanai",
					surface0: 3,
					surface1: 12,
				},
			},
			hwnd: 0,
			craftman: "Nanai Project",
		};
		mockInvoke.mockResolvedValueOnce(JSON.stringify(mockFmo));

		const res = await updateFmoSurfaces(3, 12);
		expect(mockInvoke).toHaveBeenCalledWith("update_fmo_surfaces", {
			surface0: 3,
			surface1: 12,
		});
		expect(res.ghosts["0"].surface0).toBe(3);
		expect(res.ghosts["0"].surface1).toBe(12);
	});

	it("updateFmoLifecycleState updates lifecycle state and visibility", async () => {
		const mockFmo = {
			ghosts: {
				"0": {
					name: "Nanai",
					lifecycle_state: "background",
					is_visible: false,
				},
			},
			hwnd: 0,
			craftman: "Nanai Project",
		};
		mockInvoke.mockResolvedValueOnce(JSON.stringify(mockFmo));

		const res = await updateFmoLifecycleState("background", false);
		expect(mockInvoke).toHaveBeenCalledWith("update_fmo_lifecycle_state", {
			lifecycle_state: "background",
			is_visible: false,
		});
		expect(res.ghosts["0"].lifecycle_state).toBe("background");
		expect(res.ghosts["0"].is_visible).toBe(false);
	});

	it("checkBaseWareMutex checks ssp and sakura mutexes", async () => {
		const mutexStatus = { ssp: true, sakura: true, NanaiFMO: true };
		mockInvoke.mockResolvedValueOnce(mutexStatus);

		const res = await checkBaseWareMutex();
		expect(mockInvoke).toHaveBeenCalledWith("check_base_ware_mutex", {});
		expect(res).toEqual(mutexStatus);
	});

	it("filters active and visible ghosts correctly", () => {
		const systemStatus = {
			ghosts: {
				g1: {
					name: "ActiveGhost",
					surface0: 0,
					surface1: 10,
					balloon0: "",
					balloon1: "",
					path: "/g1",
					is_visible: true,
					lifecycle_state: "active",
				},
				g2: {
					name: "PausedGhost",
					surface0: 0,
					surface1: 10,
					balloon0: "",
					balloon1: "",
					path: "/g2",
					is_visible: false,
					lifecycle_state: "paused",
				},
				g3: {
					name: "StoppedGhost",
					surface0: 0,
					surface1: 10,
					balloon0: "",
					balloon1: "",
					path: "/g3",
					is_visible: false,
					lifecycle_state: "stopped",
				},
				g4: {
					name: "BackgroundGhost",
					surface0: 0,
					surface1: 10,
					balloon0: "",
					balloon1: "",
					path: "/g4",
					is_visible: false,
					lifecycle_state: "background",
				},
			},
			hwnd: 100,
			craftman: "tester",
		};

		const active = filterActiveGhosts(systemStatus);
		expect(Object.keys(active)).toEqual(["g1", "g4"]);

		const visible = filterVisibleGhosts(systemStatus);
		expect(Object.keys(visible)).toEqual(["g1"]);
	});
});
