import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DictationManager } from "../ui/js/core/actions/dictation.js";

describe("DictationManager", () => {
<<<<<<< HEAD
	let originalWindow: unknown = null;
	let originalSpeechSynthesisUtterance: unknown = null;
=======
	// biome-ignore lint/suspicious/noImplicitAnyLet: automated fix
	let originalWindow;
	// biome-ignore lint/suspicious/noImplicitAnyLet: automated fix
	let originalSpeechSynthesisUtterance;
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad

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
		delete globalThis.window;
		try {
			const manager = new DictationManager({});
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
			constructor(text) {
				this.text = text;
				this.lang = "";
				this.rate = 0;
				this.pitch = 0;
			}
		}

		const mockSpeak = vi.fn();
		globalThis.window = {
			SpeechRecognition: MockSpeechRecognition,
			speechSynthesis: {
				speak: mockSpeak,
			},
		};
		globalThis.SpeechSynthesisUtterance = MockSpeechSynthesisUtterance;

		const mockApp = {
			ghostController: {
				sendShioriEvent: vi.fn(),
			},
		};

		const manager = new DictationManager(mockApp);
		expect(manager.recognition).toBeInstanceOf(MockSpeechRecognition);
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
		manager.recognition.onresult(fakeEvent);
		expect(mockApp.ghostController.sendShioriEvent).toHaveBeenCalledWith(
			"OnUserInput",
			["こんにちは、ナナイ"],
		);

		// onerror event
		const consoleWarnSpy = vi
			.spyOn(console, "warn")
			.mockImplementation(() => {});
		manager.recognition.onerror({ error: "network" });
		expect(consoleWarnSpy).toHaveBeenCalledWith(
			"⚠️ [Dictation] Speech recognition error:",
			"network",
		);

		// onend event
		manager.recognition.onend();
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
			speechSynthesis: {},
		};

		const manager = new DictationManager(null);
		expect(manager.recognition).toBeInstanceOf(MockWebkitSpeechRecognition);
	});

	it("handles onresult when app or ghostController or sendShioriEvent is missing", () => {
		class MockSpeechRecognition {
			constructor() {
				this.onresult = null;
			}
			start() {}
			stop() {}
		}
		globalThis.window = {
			SpeechRecognition: MockSpeechRecognition,
			speechSynthesis: {},
		};

		const manager1 = new DictationManager(null);
		expect(() =>
			manager1.recognition.onresult({ results: [[{ transcript: "test" }]] }),
		).not.toThrow();

		const manager2 = new DictationManager({});
		expect(() =>
			manager2.recognition.onresult({ results: [[{ transcript: "test" }]] }),
		).not.toThrow();
	});
});
