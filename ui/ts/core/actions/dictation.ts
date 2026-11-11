/**
 * @file dictation.js
 * @brief SSP 互換音声認識（Dictation）および音声合成（TTS）モジュール (Web Speech API)
 * [config/dictation.md], [functions/speech-recognition.md], [functions/speech-synthesis.md]
 */
import { emit } from "../tauri-helper.js";

interface SpeechRecognitionInstance {
	lang: string;
	interimResults: boolean;
	maxAlternatives: number;
	onresult: ((event: { results: { transcript: string }[][] }) => void) | null;
	onerror: ((event: { error: unknown }) => void) | null;
	onend: (() => void) | null;
	start(): void;
	stop(): void;
}

export class DictationManager {
	app: import("../../../main.js").NanaiAndroidMascotApp;
	synth: SpeechSynthesis | null;
	recognition: SpeechRecognitionInstance | null;
	isListening: boolean;
	constructor(app: import("../../../main.js").NanaiAndroidMascotApp) {
		this.app = app;
		this.synth = typeof window !== "undefined" ? window.speechSynthesis : null;
		this.recognition = null;
		this.isListening = false;
		this.initSpeechRecognition();
	}

	initSpeechRecognition() {
		if (typeof window === "undefined") return;
		const win = window as unknown as {
			SpeechRecognition?: new () => SpeechRecognitionInstance;
			webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
		};
		const SpeechRecognition =
			win.SpeechRecognition || win.webkitSpeechRecognition;
		if (SpeechRecognition) {
			const rec = new SpeechRecognition();
			rec.lang = "ja-JP";
			rec.interimResults = false;
			rec.maxAlternatives = 1;

			rec.onresult = (event: { results: { transcript: string }[][] }) => {
				const text = String(event.results[0]?.[0]?.transcript ?? "");
				console.log("🎤 [Dictation] Speech recognized:", text);
				if (this.app?.ghostController?.sendShioriEvent) {
					this.app.ghostController.sendShioriEvent("OnUserInput", [text]);
				}
				emit("dictation-result", { text });
			};

			rec.onerror = (event: { error: unknown }) => {
				console.warn("⚠️ [Dictation] Speech recognition error:", event.error);
			};

			rec.onend = () => {
				this.isListening = false;
				emit("dictation-ended", {});
			};
			this.recognition = rec;
		}
	}

	startListening() {
		if (this.recognition && !this.isListening) {
			try {
				this.recognition.start();
				this.isListening = true;
				console.log("🎤 [Dictation] Listening started...");
				emit("dictation-started", {});
			} catch (e) {
				console.warn("Failed to start speech recognition:", e);
			}
		}
	}

	stopListening() {
		if (this.recognition && this.isListening) {
			this.recognition.stop();
			this.isListening = false;
		}
	}

	speakText(text: string, lang = "ja-JP") {
		if (!this.synth) return;
		const cleanText = text.replace(
			/\\([0-9hwnsblfxtqea_]\[[^\]]*\]|[0-9hwnsblfxtqea_])/g,
			"",
		);
		if (!cleanText.trim()) return;

		const utterance = new SpeechSynthesisUtterance(cleanText);
		utterance.lang = lang;
		utterance.rate = 1.0;
		utterance.pitch = 1.0;
		this.synth.speak(utterance);
	}
}
