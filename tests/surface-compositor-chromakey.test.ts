import { describe, expect, it } from "vitest";
import { processChromaKey } from "../ui/ts/surface/surface-compositor";

describe("processChromaKey chroma-key transparency unit tests", () => {
	it("returns empty string or original image if imageSrc is invalid or empty", async () => {
		expect(await processChromaKey("")).toBe("");
		expect(await processChromaKey(null as any)).toBe("");
	});

	it("returns original image in non-DOM environment without throwing", async () => {
		const result = await processChromaKey("data:image/png;base64,mock");
		expect(result).toBe("data:image/png;base64,mock");
	});

	it("uses cache if available", async () => {
		const cache = new Map<string, string>();
		cache.set("test_key__false_false", "cached_result");
		const res = await processChromaKey("test_key", null, cache);
		expect(res).toBe("cached_result");
	});
});
