import { beforeEach, describe, expect, it } from "vitest";
import { shioriNotifyMethods } from "../../ui/ts/ghost/shiori-notify.js";
import {
	createMockShioriController,
	type MockShioriController,
} from "./helpers.js";

describe("shiori-notify HEADLINE & RSS protocols", () => {
	let mockController: MockShioriController;

	beforeEach(() => {
		mockController = createMockShioriController();
	});

	it("sends OnHeadlinesenseBegin with siteName and url", async () => {
		const notifyObj = {
			...shioriNotifyMethods,
			sendShioriNotify: mockController.sendShioriNotify,
		};

		await notifyObj.sendHeadlineSenseBegin(
			"Test Site",
			"https://example.com/rss",
		);
		expect(mockController.sendShioriNotify).toHaveBeenCalledWith(
			"OnHeadlinesenseBegin",
			["Test Site", "https://example.com/rss"],
		);
	});

	it("sends OnHeadlinesense.OnFind with phase and content", async () => {
		const notifyObj = {
			...shioriNotifyMethods,
			sendShioriNotify: mockController.sendShioriNotify,
		};

		await notifyObj.sendHeadlineSenseOnFind(
			"Test Site",
			"https://example.com/rss",
			"first",
			"Headline content item",
		);
		expect(mockController.sendShioriNotify).toHaveBeenCalledWith(
			"OnHeadlinesense.OnFind",
			[
				"Test Site",
				"https://example.com/rss",
				"first",
				"Headline content item",
			],
		);
	});

	it("sends OnHeadlinesenseComplete with reason", async () => {
		const notifyObj = {
			...shioriNotifyMethods,
			sendShioriNotify: mockController.sendShioriNotify,
		};

		await notifyObj.sendHeadlineSenseComplete("no update");
		expect(mockController.sendShioriNotify).toHaveBeenCalledWith(
			"OnHeadlinesenseComplete",
			["no update"],
		);
	});

	it("sends OnHeadlinesenseFailure with reason", async () => {
		const notifyObj = {
			...shioriNotifyMethods,
			sendShioriNotify: mockController.sendShioriNotify,
		};

		await notifyObj.sendHeadlineSenseFailure("can't open");
		expect(mockController.sendShioriNotify).toHaveBeenCalledWith(
			"OnHeadlinesenseFailure",
			["can't open"],
		);
	});

	it("sends OnRSSBegin, OnRSSComplete (no update & with entries), and OnRSSFailure", async () => {
		const notifyObj = {
			...shioriNotifyMethods,
			sendShioriNotify: mockController.sendShioriNotify,
		};

		await notifyObj.sendRssBegin("RSS Site", "https://example.com/feed.xml");
		expect(mockController.sendShioriNotify).toHaveBeenCalledWith("OnRSSBegin", [
			"RSS Site",
			"https://example.com/feed.xml",
		]);

		await notifyObj.sendRssComplete("no update");
		expect(mockController.sendShioriNotify).toHaveBeenCalledWith(
			"OnRSSComplete",
			["no update"],
		);

		await notifyObj.sendRssComplete("RSS Site", "https://example.com", [
			"Item 1\x01https://example.com/1",
			"Item 2\x01https://example.com/2",
		]);
		expect(mockController.sendShioriNotify).toHaveBeenCalledWith(
			"OnRSSComplete",
			[
				"RSS Site",
				"https://example.com",
				"Item 1\x01https://example.com/1",
				"Item 2\x01https://example.com/2",
			],
		);

		await notifyObj.sendRssFailure("timeout");
		expect(mockController.sendShioriNotify).toHaveBeenCalledWith(
			"OnRSSFailure",
			["timeout"],
		);
	});
});
