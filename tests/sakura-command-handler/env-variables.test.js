import assert from "node:assert/strict";
import { describe, it } from "vitest";
import {
	expandSakuraScriptEnv,
	resetScriptScopeState,
	scriptLifetimeState,
} from "../../ui/js/ghost/sakura-command-handler.js";
import { setupMockDom } from "./helpers.js";

setupMockDom();

describe("SakuraCommandHandler - Environment Variables", () => {
	it("expandSakuraScriptEnv properly resolves UKADOC/SSP variables", () => {
		const script =
			"Hello %username! I am %selfname (alias %ms, %selfname2) and partner is %keroname. Last: %lastghostname (%lastobjectname). Escaped: \\%username. Star: %*. Word: %m?. Prop: %property[username], %property[currentghost.name], %property[lastghostname]. Screen: %screenwidthx%screenheight.";
		const expanded = expandSakuraScriptEnv(script, {
			username: "Master",
			selfname: "Nanai",
			keroname: "Kero",
			lastghostname: "PreviousGhost",
			lastobjectname: "PreviousObject",
			screenWidth: 1920,
			screenHeight: 1080,
			randomWords: ["TestWord"],
		});

		assert.ok(expanded.includes("Hello Master!"));
		assert.ok(expanded.includes("I am Nanai (alias Nanai, Nanai)"));
		assert.ok(expanded.includes("partner is Kero"));
		assert.ok(expanded.includes("Last: PreviousGhost (PreviousObject)"));
		assert.ok(expanded.includes("Escaped: %username"));
		assert.ok(expanded.includes("Star: \\![*]"));
		assert.ok(expanded.includes("Word: TestWord"));
		assert.ok(expanded.includes("Prop: Master, Nanai, PreviousGhost."));
		assert.ok(expanded.includes("Screen: 1920x1080."));

		// Lifetime state testing
		scriptLifetimeState.setVariable("customVar", "ActiveValue");
		const resWithCustom = expandSakuraScriptEnv("Value: %property[customVar]");
		assert.equal(resWithCustom, "Value: ActiveValue");

		resetScriptScopeState();
		const resAfterReset = expandSakuraScriptEnv("Value: %property[customVar]");
		assert.equal(resAfterReset, "Value: ");
	});
});
