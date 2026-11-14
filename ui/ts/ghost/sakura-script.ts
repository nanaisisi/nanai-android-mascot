/**
 * SakuraScriptPlayer facade (powered by Pure Rust / WASM core SakuraPlayerEngine)
 */
import {
	createSakuraPlayerWasm,
	freeSakuraPlayerWasm,
	stepSakuraPlayerWasm,
} from "../core/wasm/wasm-sakura.js";

export class SakuraScriptPlayer {
	private playerInstance: unknown = null;
	private currentScript = "";

	constructor(script = "") {
		if (script) {
			this.loadScript(script);
		}
	}

	public loadScript(script: string): void {
		this.stop();
		this.currentScript = script;
		this.playerInstance = createSakuraPlayerWasm(script);
	}

	public play(): void {
		if (!this.playerInstance && this.currentScript) {
			this.playerInstance = createSakuraPlayerWasm(this.currentScript);
		}
	}

	public step(): unknown | null {
		if (!this.playerInstance) return null;
		return stepSakuraPlayerWasm(this.playerInstance);
	}

	public stop(): void {
		if (this.playerInstance) {
			freeSakuraPlayerWasm(this.playerInstance);
			this.playerInstance = null;
		}
	}

	public pause(): void {}
	public resume(): void {}

	public reset(): void {
		this.stop();
		if (this.currentScript) {
			this.play();
		}
	}
}
