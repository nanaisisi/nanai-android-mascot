import { beforeEach, describe, expect, it, vi } from "vitest";
import { applyAssetProperties } from "../ui/ts/core/actions/balloon-descript/assets.js";
import { applySpecialFontProperties } from "../ui/ts/core/actions/balloon-descript/font/special.js";
import { applyPositionProperties } from "../ui/ts/core/actions/balloon-descript/layout/position.js";
import {
	checkBaseWareMutex,
	getFmoStatus,
	notifySstpBlacklisting,
	notifySstpBreak,
	sendRawSstp,
	sendSstpRequest,
	updateFmoBalloonText,
	updateFmoLifecycleState,
	updateFmoSurfaces,
} from "../ui/ts/core/actions/sstp-fmo-actions.js";

vi.mock("../ui/ts/core/tauri-helper.js", () => ({
	invoke: vi.fn(),
	isTauriAvailable: vi.fn(() => true),
}));

import { invoke } from "../ui/ts/core/tauri-helper.js";

describe("SSTP & FMO frontend actions (Slot-01)", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("sendSstpRequest invokes backend send_sstp_request", async () => {
		const mockResponse = {
			status: "200 OK",
			value: "processed",
		};
		vi.mocked(invoke).mockResolvedValueOnce(mockResponse);

		const req = {
			method: "SEND",
			sender: "TestSender",
			script: "\\0\\s[0]Hello!\\e",
		};
		const res = await sendSstpRequest(req);
		expect(invoke).toHaveBeenCalledWith("send_sstp_request", { request: req });
		expect(res).toEqual(mockResponse);
	});

	it("sendRawSstp invokes backend parse_and_send_sstp_raw", async () => {
		const raw =
			"SEND SSTP/1.1\r\nSender: Test\r\nScript: \\0\\s[0]Hi\\e\r\n\r\n";
		const mockResponse = {
			status: "200 OK",
			value: "processed",
		};
		vi.mocked(invoke).mockResolvedValueOnce(mockResponse);

		const res = await sendRawSstp(raw);
		expect(invoke).toHaveBeenCalledWith("parse_and_send_sstp_raw", {
			raw_request: raw,
		});
		expect(res).toEqual(mockResponse);
	});

	it("notifySstpBreak invokes backend notify_sstp_break", async () => {
		const payload = {
			script: "\\0\\s[0]Interrupted\\e",
			scope: 0,
			break_position: 15,
		};
		const expectedReturn = {
			ID: "OnSSTPBreak",
			Reference0: "\\0\\s[0]Interrupted\\e",
			Reference1: "0",
			Reference2: "15",
		};
		vi.mocked(invoke).mockResolvedValueOnce(expectedReturn);

		const res = await notifySstpBreak(payload);
		expect(invoke).toHaveBeenCalledWith("notify_sstp_break", {
			event: payload,
		});
		expect(res).toEqual(expectedReturn);
	});

	it("notifySstpBlacklisting invokes backend notify_sstp_blacklisting", async () => {
		const payload = {
			client_ip: "192.168.1.100",
		};
		const expectedReturn = {
			ID: "OnSSTPBlacklisting",
			Reference0: "192.168.1.100",
		};
		vi.mocked(invoke).mockResolvedValueOnce(expectedReturn);

		const res = await notifySstpBlacklisting(payload);
		expect(invoke).toHaveBeenCalledWith("notify_sstp_blacklisting", {
			event: payload,
		});
		expect(res).toEqual(expectedReturn);
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
		vi.mocked(invoke).mockResolvedValueOnce(JSON.stringify(mockFmo));

		const status = await getFmoStatus();
		expect(invoke).toHaveBeenCalledWith("get_fmo_status");
		expect(status).toEqual(mockFmo);
	});

	it("getFmoStatus returns fallback on JSON parse failure", async () => {
		vi.mocked(invoke).mockResolvedValueOnce("invalid json");

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
		vi.mocked(invoke).mockResolvedValueOnce(JSON.stringify(mockFmo));

		const res = await updateFmoBalloonText("Updated Text", "");
		expect(invoke).toHaveBeenCalledWith("update_fmo_balloon_text", {
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
		vi.mocked(invoke).mockResolvedValueOnce(JSON.stringify(mockFmo));

		const res = await updateFmoSurfaces(3, 12);
		expect(invoke).toHaveBeenCalledWith("update_fmo_surfaces", {
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
		vi.mocked(invoke).mockResolvedValueOnce(JSON.stringify(mockFmo));

		const res = await updateFmoLifecycleState("background", false);
		expect(invoke).toHaveBeenCalledWith("update_fmo_lifecycle_state", {
			lifecycle_state: "background",
			is_visible: false,
		});
		expect(res.ghosts["0"].lifecycle_state).toBe("background");
		expect(res.ghosts["0"].is_visible).toBe(false);
	});

	it("checkBaseWareMutex checks ssp and sakura mutexes", async () => {
		const mutexStatus = { ssp: true, sakura: true, NanaiFMO: true };
		vi.mocked(invoke).mockResolvedValueOnce(mutexStatus);

		const res = await checkBaseWareMutex();
		expect(invoke).toHaveBeenCalledWith("check_base_ware_mutex");
		expect(res).toEqual(mutexStatus);
	});
});

function createMockRoot() {
	const vars: Record<string, string> = {};
	return {
		style: {
			setProperty(k: string, v: string) {
				vars[k] = v;
			},
			removeProperty(k: string) {
				delete vars[k];
			},
			getPropertyValue(k: string) {
				return vars[k] || "";
			},
		},
		vars,
	};
}

describe("SSTP Balloon Descript Styling & Font bindings", () => {
	it("applies sstpmessage.font.* properties to CSS custom properties", () => {
		const el = createMockRoot();
		const props: Record<string, string> = {
			"sstpmessage.font.name": "MS Gothic",
			"sstpmessage.font.height": "14",
			"sstpmessage.font.color.r": "255",
			"sstpmessage.font.color.g": "100",
			"sstpmessage.font.color.b": "50",
		};

		applySpecialFontProperties(el, props);
		expect(el.style.getPropertyValue("--balloon-sstp-font-family")).toBe(
			'"MS Gothic", sans-serif',
		);
		expect(el.style.getPropertyValue("--balloon-sstp-font-size")).toBe("14px");
		expect(el.style.getPropertyValue("--balloon-sstp-font-color")).toBe(
			"rgb(255, 100, 50)",
		);
	});

	it("applies sstpmessage position and sstpmarker coordinates", () => {
		const el = createMockRoot();
		const instance: Record<string, unknown> = {};
		const props: Record<string, string> = {
			"sstpmessage.x": "12",
			"sstpmessage.y": "24",
			"sstpmessage.xr": "80",
			"sstpmessage.yb": "90",
			"sstpmarker.x": "5",
			"sstpmarker.y": "10",
		};

		applyPositionProperties(el, props, instance);
		expect(el.style.getPropertyValue("--balloon-sstpmessage-x")).toBe("12px");
		expect(el.style.getPropertyValue("--balloon-sstpmessage-y")).toBe("24px");
		expect(el.style.getPropertyValue("--balloon-sstpmessage-xr")).toBe("80px");
		expect(el.style.getPropertyValue("--balloon-sstpmessage-yb")).toBe("90px");

		applyAssetProperties(el, props, instance);
		expect(el.style.getPropertyValue("--balloon-sstpmarker-x")).toBe("5px");
		expect(el.style.getPropertyValue("--balloon-sstpmarker-y")).toBe("10px");
	});
});
