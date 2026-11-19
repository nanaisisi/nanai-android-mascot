import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { NanaiAndroidMascotApp } from "../ui/main.js";
import { DictationManager } from "../ui/ts/core/actions/dictation.js";

describe("DictationManager", () => {
	let originalWindow: typeof globalThis.window;
	let originalSpeechSynthesisUtterance: typeof globalThis.SpeechSynthesisUtterance;

	beforeEach(() => {
		originalWindow = globalThis.window;
		originalSpeechSynthesisUtterance = globalThis.SpeechSynthesisUtterance;
	});

	afterEach(() => {
		globalThis.window = originalWindow;
		globalThis.SpeechSynthesisUtterance = originalSpeechSynthesisUtterance;
		vi.restoreAllMocks();
	});

	it("handles environment without window gracefully", () => {
		const saved = globalThis.window;
		delete (globalThis as { window?: Window & typeof globalThis }).window;
		try {
			const manager = new DictationManager(
				{} as unknown as NanaiAndroidMascotApp,
			);
			expect(manager.synth).toBeNull();
			expect(manager.recognition).toBeNull();
			manager.startListening();
			manager.stopListening();
			manager.speakText("hello");
		} finally {
			globalThis.window = saved;
		}
	});

	it("initializes speech recognition and handles events", () => {
		class MockSpeechRecognition {
			lang: string;
			interimResults: boolean;
			maxAlternatives: number;
			onresult:
				| ((event: { results: { transcript: string }[][] }) => void)
				| null;
			onerror: ((event: { error: unknown }) => void) | null;
			onend: (() => void) | null;
			constructor() {
				this.lang = "";
				this.interimResults = true;
				this.maxAlternatives = 0;
				this.onresult = null;
				this.onerror = null;
				this.onend = null;
			}
			start() {}
			stop() {}
		}

		class MockSpeechSynthesisUtterance {
			text: string;
			lang: string;
			rate: number;
			pitch: number;
			constructor(text: string) {
				this.text = text;
				this.lang = "";
				this.rate = 0;
				this.pitch = 0;
			}
		}

		const mockSpeak = vi.fn<(utterance: SpeechSynthesisUtterance) => void>();
		globalThis.window = {
			SpeechRecognition: MockSpeechRecognition,
			speechSynthesis: {
				speak: mockSpeak,
			} as unknown as SpeechSynthesis,
		} as unknown as Window & typeof globalThis;
		globalThis.SpeechSynthesisUtterance =
			MockSpeechSynthesisUtterance as unknown as typeof SpeechSynthesisUtterance;

		const mockApp = {
			ghostController: {
				sendShioriEvent: vi.fn(),
			},
		};

		const manager = new DictationManager(
			mockApp as unknown as NanaiAndroidMascotApp,
		);
		expect(manager.recognition).toBeInstanceOf(MockSpeechRecognition);
		if (!manager.recognition) {
			throw new Error("Expected manager.recognition to be initialized");
		}
		expect(manager.recognition.lang).toBe("ja-JP");
		expect(manager.isListening).toBe(false);

		// startListening
		manager.startListening();
		expect(manager.isListening).toBe(true);

		// calling startListening again does nothing if already listening
		manager.startListening();
		expect(manager.isListening).toBe(true);

		// onresult event
		const fakeEvent = {
			results: [[{ transcript: "こんにちは、ナナイ" }]],
		};
		manager.recognition.onresult?.(fakeEvent);
		expect(mockApp.ghostController.sendShioriEvent).toHaveBeenCalledWith(
			"OnUserInput",
			["こんにちは、ナナイ"],
		);

		// onerror event
		const consoleWarnSpy = vi
			.spyOn(console, "warn")
			.mockImplementation(() => {});
		manager.recognition.onerror?.({ error: "network" });
		expect(consoleWarnSpy).toHaveBeenCalledWith(
			"⚠️ [Dictation] Speech recognition error:",
			"network",
		);

		// onend event
		manager.recognition.onend?.();
		expect(manager.isListening).toBe(false);

		// stopListening when listening
		manager.startListening();
		expect(manager.isListening).toBe(true);
		manager.stopListening();
		expect(manager.isListening).toBe(false);

		// stopListening when already not listening does nothing
		manager.stopListening();
		expect(manager.isListening).toBe(false);

		// startListening with error
		vi.spyOn(manager.recognition, "start").mockImplementation(() => {
			throw new Error("Start failed");
		});
		manager.startListening();
		expect(consoleWarnSpy).toHaveBeenCalledWith(
			"Failed to start speech recognition:",
			expect.any(Error),
		);

		// speakText - strips Sakura script tags like \0, \s[0], \w[500], \n, \e
		manager.speakText("\\0\\s[0]こんにちは\\w[500]\\n元気ですか？\\e");
		expect(mockSpeak).toHaveBeenCalledTimes(1);
		const utterance = mockSpeak.mock.calls[0][0];
		expect(utterance.text).toBe("こんにちは元気ですか？");
		expect(utterance.lang).toBe("ja-JP");
		expect(utterance.rate).toBe(1.0);
		expect(utterance.pitch).toBe(1.0);

		// custom lang parameter
		mockSpeak.mockClear();
		manager.speakText("Hello world", "en-US");
		expect(mockSpeak).toHaveBeenCalledTimes(1);
		expect(mockSpeak.mock.calls[0][0].lang).toBe("en-US");

		// speakText empty / whitespace text
		mockSpeak.mockClear();
		manager.speakText("\\0\\s[0]\\e");
		expect(mockSpeak).not.toHaveBeenCalled();

		// speakText when synth is null
		manager.synth = null;
		manager.speakText("テスト");
		expect(mockSpeak).not.toHaveBeenCalled();
	});

	it("uses webkitSpeechRecognition fallback when available", () => {
		class MockWebkitSpeechRecognition {
			start() {}
			stop() {}
		}

		globalThis.window = {
			webkitSpeechRecognition: MockWebkitSpeechRecognition,
			speechSynthesis: {} as unknown as SpeechSynthesis,
		} as unknown as Window & typeof globalThis;

		const manager = new DictationManager(
			null as unknown as NanaiAndroidMascotApp,
		);
		expect(manager.recognition).toBeInstanceOf(MockWebkitSpeechRecognition);
	});

	it("handles onresult when app or ghostController or sendShioriEvent is missing", () => {
		class MockSpeechRecognition {
			onresult:
				| ((event: { results: { transcript: string }[][] }) => void)
				| null;
			constructor() {
				this.onresult = null;
			}
			start() {}
			stop() {}
		}
		globalThis.window = {
			SpeechRecognition: MockSpeechRecognition,
			speechSynthesis: {} as unknown as SpeechSynthesis,
		} as unknown as Window & typeof globalThis;

		const manager1 = new DictationManager(
			null as unknown as NanaiAndroidMascotApp,
		);
		const rec1 = manager1.recognition;
		if (!rec1?.onresult) {
			throw new Error("Expected manager1.recognition.onresult to be set");
		}
		const onResult1 = rec1.onresult;
		expect(() =>
			onResult1({ results: [[{ transcript: "test" }]] }),
		).not.toThrow();

		const manager2 = new DictationManager(
			{} as unknown as NanaiAndroidMascotApp,
		);
		const rec2 = manager2.recognition;
		if (!rec2?.onresult) {
			throw new Error("Expected manager2.recognition.onresult to be set");
		}
		const onResult2 = rec2.onresult;
		expect(() =>
			onResult2({ results: [[{ transcript: "test" }]] }),
		).not.toThrow();
	});
});
