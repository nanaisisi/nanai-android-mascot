import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { SakuraScriptPlayer } from "../ui/ts/ghost/sakura-script.js";

describe("SakuraScriptPlayer Balloon Display Integration", () => {
	it("initializes and handles script loading and play state", () => {
		const player = new SakuraScriptPlayer();
		assert.equal(player.isPlaying, false);

		player.loadScript("\\0Hello World\\e");
		assert.equal(player.lastScript, "\\0Hello World\\e");

		player.stop();
		assert.equal(player.isPlaying, false);
	});

	it("updates balloon display element when processing StepOutput", () => {
		const balloonText = {
			textContent: "",
			innerHTML: "",
			appendChild(node: any) {
				this.textContent += node.textContent || "";
			},
		};
		const balloonDisplay = { style: { display: "none" } };
		const keroBalloonText = {
			textContent: "",
			innerHTML: "",
			appendChild(node: any) {
				this.textContent += node.textContent || "";
			},
		};
		const keroBalloonDisplay = { style: { display: "none" } };
		const keroSlot = { style: { display: "none" } };

		const mockApp = {
			elements: {
				balloonText,
				balloonDisplay,
				keroBalloonText,
				keroBalloonDisplay,
				keroSlot,
			},
			currentBalloonTheme: "default",
			ghostController: {
				updateSurface(_id: number, _scope: number) {},
			},
		};

		const player = new SakuraScriptPlayer("", mockApp);

		// 1. Process TextAppend for scope 0 (sakura)
		(player as any).appendTextToBalloon(mockApp, 0, "Hello Sakura");
		assert.equal(balloonDisplay.style.display, "block");
		assert.ok(balloonText.textContent.includes("Hello Sakura"));

		// 2. Process TextAppend for scope 1 (kero)
		(player as any).appendTextToBalloon(mockApp, 1, "Hello Kero");
		assert.equal(keroDisplayOrSlotStyle(keroBalloonDisplay), "block");
		assert.equal(keroSlot.style.display, "block");
		assert.ok(keroBalloonText.textContent.includes("Hello Kero"));

		// 3. Clear balloon
		(player as any).clearBalloon(mockApp, 0);
		assert.equal(balloonDisplay.style.display, "none");
		assert.equal(balloonText.textContent, "");
	});
});

function keroDisplayOrSlotStyle(el: any) {
	return el?.style?.display;
}
