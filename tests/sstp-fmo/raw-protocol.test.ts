import { describe, expect, it } from "vitest";
import {
	buildRawSstpRequest,
	parseRawSstpResponse,
} from "../../ui/ts/core/actions/sstp-fmo-actions.js";

describe("SSTP Raw Protocol Builder and Parser", () => {
	it("should build raw SSTP request string with all headers", () => {
		const raw = buildRawSstpRequest({
			method: "SEND",
			sender: "TestApp",
			script: "\\h\\s[0]Hello\\e",
			event: "OnTest",
			sentence: "Custom sentence",
			command: "GetVersion",
			receiver_ghost_name: "Nanai",
			receiver_ghost_hwnd: 1234,
			hwnd: 5678,
			id: "req_01",
			options: ["nobreak", "notranslate"],
			connection: "keep-alive",
			surface: "0,10",
			document: "doc.txt",
			song: "theme.mp3",
			module: "internal_crypto",
			references: {
				Reference0: "val0",
				Reference1: "val1",
			},
		});

		expect(raw).toContain("SEND SSTP/1.4\r\n");
		expect(raw).toContain("Charset: UTF-8\r\n");
		expect(raw).toContain("Sender: TestApp\r\n");
		expect(raw).toContain("Script: \\h\\s[0]Hello\\e\r\n");
		expect(raw).toContain("Event: OnTest\r\n");
		expect(raw).toContain("Sentence: Custom sentence\r\n");
		expect(raw).toContain("Command: GetVersion\r\n");
		expect(raw).toContain("ReceiverGhostName: Nanai\r\n");
		expect(raw).toContain("ReceiverGhostHWnd: 1234\r\n");
		expect(raw).toContain("HWnd: 5678\r\n");
		expect(raw).toContain("ID: req_01\r\n");
		expect(raw).toContain("Option: nobreak, notranslate\r\n");
		expect(raw).toContain("Connection: keep-alive\r\n");
		expect(raw).toContain("Surface: 0,10\r\n");
		expect(raw).toContain("Document: doc.txt\r\n");
		expect(raw).toContain("Song: theme.mp3\r\n");
		expect(raw).toContain("Module: internal_crypto\r\n");
		expect(raw).toContain("Reference0: val0\r\n");
		expect(raw).toContain("Reference1: val1\r\n");
	});

	it("should parse raw SSTP response strings including headers and additional data", () => {
		const rawSuccess =
			"SSTP/1.4 200 OK\r\nCharset: UTF-8\r\nScript: \\0Hi\\e\r\nReference0: data0\r\nID: OnTest\r\n\r\nExtra Data Body";
		const parsed = parseRawSstpResponse(rawSuccess);
		expect(parsed.status).toBe("200 OK");
		expect(parsed.value).toBe("\\0Hi\\e");
		expect(parsed.reference0).toBe("data0");
		expect(parsed.id).toBe("OnTest");
		expect(parsed.additional_data).toBe("Extra Data Body");

		const rawError =
			"SSTP/1.4 420 Refuse\r\nErrorDescription: Command not allowed\r\n\r\n";
		const parsedError = parseRawSstpResponse(rawError);
		expect(parsedError.status).toBe("420 Refuse");
		expect(parsedError.error_description).toBe("Command not allowed");

		const emptyParsed = parseRawSstpResponse("");
		expect(emptyParsed.status).toBe("400 Bad Request");
		expect(emptyParsed.error_description).toBe("Empty response");
	});

	it("should build and parse HTTP tunneling headers and references map", () => {
		const raw = buildRawSstpRequest({
			method: "SEND",
			sender: "WebClient",
			script: "\\0Hello from HTTP\\e",
			content_type: "text/plain",
			user_agent: "Mozilla/5.0",
			host: "127.0.0.1:9801",
		});

		expect(raw).toContain("Content-Type: text/plain\r\n");
		expect(raw).toContain("User-Agent: Mozilla/5.0\r\n");
		expect(raw).toContain("Host: 127.0.0.1:9801\r\n");

		const resp =
			"SSTP/1.4 200 OK\r\nCharset: UTF-8\r\nContent-Type: text/plain\r\nReference0: First\r\nReference1: Second\r\nArgument2: Third\r\n\r\nResult payload";
		const parsed = parseRawSstpResponse(resp);
		expect(parsed.status).toBe("200 OK");
		expect(parsed.content_type).toBe("text/plain");
		expect(parsed.reference0).toBe("First");
		expect(parsed.references).toBeDefined();
		expect(parsed.references?.Reference0).toBe("First");
		expect(parsed.references?.Reference1).toBe("Second");
		expect(parsed.references?.Reference2).toBe("Third");
		expect(parsed.additional_data).toBe("Result payload");
	});
});
