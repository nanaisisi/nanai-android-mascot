import assert from "node:assert/strict";
import { describe, it } from "vitest";
import {
	expandSakuraScriptEnv,
	resetScriptScopeState,
	scriptLifetimeState,
} from "../../ui/ts/ghost/sakura-command-handler.js";
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

	it("expandSakuraScriptEnv properly resolves system.* properties", () => {
		const script =
			"Date: %property[system.year]-%property[system.month]-%property[system.day] %property[system.hour]:%property[system.minute]:%property[system.second] (ms:%property[system.millisecond], dow:%property[system.dayofweek]). OS:%property[system.os.name], CPU:%property[system.cpu.model], Mem:%property[system.memory.total], Theme:%property[system.theme.app.mode], Pos:%property[system.cursor.pos], DND:%property[system.dnd.mode], Mon:%property[system.monitor.count], Disk:%property[system.disk.count]";
		const expanded = expandSakuraScriptEnv(script);
		assert.ok(expanded.includes("OS:Linux"));
		assert.ok(expanded.includes("CPU:x86_64"));
		assert.ok(expanded.includes("Mem:1024"));
		assert.ok(expanded.includes("Theme:dark"));
		assert.ok(expanded.includes("Pos:0,0"));
		assert.ok(expanded.includes("DND:none"));
		assert.ok(expanded.includes("Mon:1"));
		assert.ok(expanded.includes("Disk:1"));
		const now = new Date();
		assert.ok(expanded.includes(String(now.getFullYear())));
	});
});
