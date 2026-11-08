/**
 * @file surface-dressup.ts
 * @brief 着せ替え (bindgroup) 管理および Rust 合成計画 (Composition Plan) 連携モジュール
 */
import { invoke, isTauriAvailable } from "../core/tauri-helper.js";
import {
	bindAnimationIds,
	bindGroupsForScope,
	dressupKey,
	patternSurfaceFile,
} from "./bind-menu.js";
import { methodToString } from "./shell-manifest.js";

export const surfaceDressupMethods = {
	async bindDressup(
<<<<<<< HEAD
		this: unknown,
=======
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		this: any,
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
		category: string,
		part: string = "",
		statusVal: string = "",
		scopeId: number = 0,
		notifyEvent: boolean = true,
	) {
		const key = `${scopeId}__${category}__${part}`;
		let newStatus = true;

		if (statusVal === "1" || statusVal === "true") {
			newStatus = true;
		} else if (statusVal === "0" || statusVal === "false") {
			newStatus = false;
		} else {
			const current = this.dressupState.get(key) ?? false;
			newStatus = !current;
		}

		this.dressupState.set(key, newStatus);
		console.log(
			`👗 着せ替え更新: scope=${scopeId}, category=${category}, part=${part}, state=${newStatus}`,
		);

		await this.app.ghostController.updateSurface(
			this.currentSurfaceIdFor(scopeId),
			scopeId,
		);

		if (notifyEvent) {
			try {
				await this.app.ghostController.sendShioriEvent("OnDressupChanged", [
					category,
					part,
					newStatus ? 1 : 0,
					scopeId,
				]);
			} catch (_err) {}
		}
	},

	activeBindLayers(
<<<<<<< HEAD
		this: unknown,
=======
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		this: any,
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
		scopeId: number = 0,
		surfaceId: number | string | null = null,
	) {
		if (!this.shellManifest) return [];
		const sid = String(surfaceId ?? this.currentSurfaceIdFor(scopeId));
		const animList = this.animations[sid] ?? [];
<<<<<<< HEAD
		const animById = new Map<string, Record<string, unknown>>(
			animList.map((a: unknown) => [
				String((a as Record<string, unknown>).id),
				a as Record<string, unknown>,
			]),
		);

		const layers: unknown[] = [];
=======
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		const animById = new Map<string, any>(
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			animList.map((a: any) => [String(a.id), a]),
		);

		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		const layers: any[] = [];
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
		const activeIds = new Set(this.activeBindAnimationIds(scopeId));

		const insertedIds = new Set();
		for (const animId of activeIds) {
<<<<<<< HEAD
			const anim: unknown = animById.get(String(animId));
=======
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			const anim: any = animById.get(String(animId));
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
			for (const p of anim?.patterns ?? []) {
				const typeLower = (p.type || "").toLowerCase();
				if (typeLower === "insert") {
					const targetId = Number.parseInt(String(p.surface).trim(), 10);
					if (!Number.isNaN(targetId)) {
						insertedIds.add(targetId);
					}
				}
			}
		}

		const visited = new Set();
<<<<<<< HEAD
		const expandAnim = (id: unknown) => {
			if (visited.has(id)) return;
			visited.add(id);
			const anim: unknown = animById.get(String(id));
=======
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		const expandAnim = (id: any) => {
			if (visited.has(id)) return;
			visited.add(id);
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			const anim: any = animById.get(String(id));
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
			if (!anim) return;
			for (const pattern of anim.patterns ?? []) {
				const typeLower = (pattern.type || "overlay").toLowerCase();
				if (typeLower === "insert") {
					const childId = Number.parseInt(String(pattern.surface).trim(), 10);
					if (!Number.isNaN(childId) && activeIds.has(childId)) {
						expandAnim(childId);
					}
				} else {
					const file = patternSurfaceFile(
						this.resolveSurfaceNumber(pattern.surface, scopeId),
					);
					if (file) {
						layers.push({
							file,
							x: pattern.x ?? 0,
							y: pattern.y ?? 0,
							type: typeLower,
						});
					}
				}
			}
		};

		for (const group of bindGroupsForScope(this.shellManifest, scopeId)) {
			if (
				!this.dressupState.get(dressupKey(scopeId, group.category, group.part))
			) {
				continue;
			}
			for (const animId of bindAnimationIds(group.number, group.add_ids)) {
				if (!insertedIds.has(animId)) {
					expandAnim(animId);
				}
			}
		}
		return layers;
	},

<<<<<<< HEAD
	activeBindAnimationIds(this: unknown, scopeId: number = 0): number[] {
		if (!this.shellManifest) return [];
		return bindGroupsForScope(this.shellManifest, scopeId)
			.filter((group: unknown) =>
				this.dressupState.get(dressupKey(scopeId, group.category, group.part)),
			)
			.flatMap((group: unknown) =>
				bindAnimationIds(group.number, group.add_ids),
			)
			.sort((a: number, b: number) => a - b);
	},

	planCacheKey(
		this: unknown,
=======
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	activeBindAnimationIds(this: any, scopeId: number = 0): number[] {
		if (!this.shellManifest) return [];
		return (
			bindGroupsForScope(this.shellManifest, scopeId)
				// biome-ignore lint/suspicious/noExplicitAny: automated fix
				.filter((group: any) =>
					this.dressupState.get(
						dressupKey(scopeId, group.category, group.part),
					),
				)
				// biome-ignore lint/suspicious/noExplicitAny: automated fix
				.flatMap((group: any) => bindAnimationIds(group.number, group.add_ids))
				.sort((a: number, b: number) => a - b)
		);
	},

	planCacheKey(
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		this: any,
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
		surfaceId: number | string,
		scopeId: number = 0,
	): string {
		return `${scopeId}__${surfaceId}__${this.activeBindAnimationIds(scopeId).join(",")}`;
	},

	async getCompositionPlan(
<<<<<<< HEAD
		this: unknown,
=======
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		this: any,
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
		surfaceId: number | string,
		scopeId: number = 0,
	) {
		if (!this.shellManifest || !isTauriAvailable()) return null;
		const sid = Number(surfaceId);
		if (!Number.isFinite(sid) || sid < 0) return null;
		const gc = this.app?.ghostController;
		const ghostName = gc?.currentGhost?.name;
		if (!ghostName) return null;

		const key = this.planCacheKey(sid, scopeId);
		if (this.planCache.has(key)) {
			return this.planCache.get(key);
		}
		try {
<<<<<<< HEAD
			const plan: unknown = await invoke("surface_composition_plan", {
=======
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			const plan: any = await invoke("surface_composition_plan", {
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
				ghostName,
				shellName: gc?.currentShell || "master",
				surfaceId: sid,
				binds: this.activeBindAnimationIds(scopeId),
			});
			if (!plan || !Array.isArray(plan.layers)) return null;
			this.planCache.set(key, plan);
			return plan;
		} catch (_err) {
			return null;
		}
	},

<<<<<<< HEAD
	planToRenderLayers(this: unknown, plan: unknown, scopeId: number = 0) {
		if (!plan?.layers?.length) return null;
		const elements: unknown[] = [];
		const bindLayers: unknown[] = [];
=======
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	planToRenderLayers(this: any, plan: any, scopeId: number = 0) {
		if (!plan?.layers?.length) return null;
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		const elements: any[] = [];
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		const bindLayers: any[] = [];
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
		let hasElement = false;
		for (const layer of plan.layers) {
			const raw = layer.Element ?? layer.Pattern;
			if (!raw) continue;
			const type = methodToString(raw.method) || "overlay";
			if (layer.Element) {
				hasElement = true;
				if (raw.file) {
					elements.push({
						file: raw.file,
						x: raw.x ?? 0,
						y: raw.y ?? 0,
						type,
					});
				}
			} else {
				const file = patternSurfaceFile(
					this.resolveSurfaceNumber(raw.surface, scopeId),
				);
				if (file) {
					bindLayers.push({ file, x: raw.x ?? 0, y: raw.y ?? 0, type });
				}
			}
		}
		if (!hasElement) return null;
		return { elements, bindLayers };
	},
};
