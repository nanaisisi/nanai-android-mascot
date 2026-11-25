import assert from "node:assert/strict";
import { afterEach, describe, it } from "vitest";
import {
	getTimemachineOffsetSeconds,
	getVirtualNowMs,
	setAllowTimemachineControl,
} from "../ui/ts/ghost/command-handler/system/timemachine.js";
import { SakuraCommandHandler } from "../ui/ts/ghost/sakura-command-handler.js";

describe("timemachine command (\\![timemachine,set/reset])", () => {
	afterEach(() => {
		setAllowTimemachineControl(true);
		const resetHandler = new SakuraCommandHandler({ currentScope: 0 } as never);
		void resetHandler.runCommand(["timemachine", "reset"]);
		setAllowTimemachineControl(false);
	});

	it("ignores set/reset when allowTimemachineControl is disabled", async () => {
		setAllowTimemachineControl(false);
		const handler = new SakuraCommandHandler({ currentScope: 0 } as never);
		await handler.runCommand(["timemachine", "set", "3600"]);
		assert.equal(getTimemachineOffsetSeconds(), 0);
	});

	it("sets virtual time offset and resets to 0 when allowed", async () => {
		setAllowTimemachineControl(true);
		const handler = new SakuraCommandHandler({ currentScope: 0 } as never);

		await handler.runCommand(["timemachine", "set", "3600"]);
		assert.equal(getTimemachineOffsetSeconds(), 3600);
		assert.equal(getVirtualNowMs(1_000_000), 1_000_000 + 3_600_000);

		await handler.runCommand(["timemachine", "reset"]);
		assert.equal(getTimemachineOffsetSeconds(), 0);
		assert.equal(getVirtualNowMs(1_000_000), 1_000_000);
	});
});
