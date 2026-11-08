import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
	notifySstpBlacklisting,
	notifySstpBreak,
	sendRawSstp,
	sendSstpRequest,
} from "../../ui/ts/core/actions/sstp-fmo-actions.js";
import { mockInvoke, setupTauriMock, teardownTauriMock } from "./helpers.js";

describe("SSTP frontend actions (Slot-01)", () => {
	beforeEach(() => {
		setupTauriMock();
		mockInvoke.mockReset();
	});

	afterEach(() => {
		teardownTauriMock();
	});

	it("sendSstpRequest invokes backend send_sstp_request", async () => {
		const mockResponse = {
			status: "200 OK",
			value: "processed",
		};
		mockInvoke.mockResolvedValueOnce(mockResponse);

		const req = {
			method: "SEND",
			sender: "TestSender",
			script: "\\0\\s[0]Hello!\\e",
		};
		const res = await sendSstpRequest(req);
		expect(mockInvoke).toHaveBeenCalledWith("send_sstp_request", {
			request: req,
		});
		expect(res).toEqual(mockResponse);
	});

	it("sendRawSstp invokes backend parse_and_send_sstp_raw", async () => {
		const raw =
			"SEND SSTP/1.1\r\nSender: Test\r\nScript: \\0\\s[0]Hi\\e\r\n\r\n";
		const mockResponse = {
			status: "200 OK",
			value: "processed",
		};
		mockInvoke.mockResolvedValueOnce(mockResponse);

		const res = await sendRawSstp(raw);
		expect(mockInvoke).toHaveBeenCalledWith("parse_and_send_sstp_raw", {
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
		mockInvoke.mockResolvedValueOnce(expectedReturn);

		const res = await notifySstpBreak(payload);
		expect(mockInvoke).toHaveBeenCalledWith("notify_sstp_break", {
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
		mockInvoke.mockResolvedValueOnce(expectedReturn);

		const res = await notifySstpBlacklisting(payload);
		expect(mockInvoke).toHaveBeenCalledWith("notify_sstp_blacklisting", {
			event: payload,
		});
		expect(res).toEqual(expectedReturn);
	});
});
