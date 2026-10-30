/**
 * @file dictation.js
 * @brief SSP 互換音声認識（Dictation）および音声合成（TTS）モジュール (Web Speech API)
 * [config/dictation.md], [functions/speech-recognition.md], [functions/speech-synthesis.md]
 */
import { emit } from "../tauri-helper.js";

export class DictationManager {
	constructor(app) {
		this.app = app;
		this.synth = typeof window !== "undefined" ? window.speechSynthesis : null;
		this.recognition = null;
		this.isListening = false;
		this.initSpeechRecognition();
	}

	initSpeechRecognition() {
		if (typeof window === "undefined") return;
		const SpeechRecognition =
			window.SpeechRecognition || window.webkitSpeechRecognition;
		if (SpeechRecognition) {
			this.recognition = new SpeechRecognition();
			this.recognition.lang = "ja-JP";
			this.recognition.interimResults = false;
			this.recognition.maxAlternatives = 1;

			this.recognition.onresult = (event) => {
				const text = event.results[0][0].transcript;
				console.log("🎤 [Dictation] Speech recognized:", text);
				if (this.app?.ghostController?.sendShioriEvent) {
					this.app.ghostController.sendShioriEvent("OnUserInput", [text]);
				}
				emit("dictation-result", { text });
			};

			this.recognition.onerror = (event) => {
				console.warn("⚠️ [Dictation] Speech recognition error:", event.error);
			};

			this.recognition.onend = () => {
				this.isListening = false;
				emit("dictation-ended", {});
			};
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

	speakText(text, lang = "ja-JP") {
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
