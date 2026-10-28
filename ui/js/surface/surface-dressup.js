/**
 * @file surface-dressup.js
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
	/**
	 * 着せ替えパーツの装着/解除 (\![bind,category,part,status] UKADOC準拠)
	 * @this {import('./surface-manager.js').SurfaceManager}
	 */
	async bindDressup(
		category,
		part = "",
		statusVal = "",
		scopeId = 0,
		notifyEvent = true,
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
			} catch (_err) {
				// イベント送信エラーは無視
			}
		}
	},

	/**
	 * 現在装着中の着せ替え (bindgroup) に対応する SERIKO bind アニメーションレイヤーを取得
	 * @this {import('./surface-manager.js').SurfaceManager}
	 */
	activeBindLayers(scopeId = 0, surfaceId = null) {
		if (!this.shellManifest) return [];
		const sid = String(surfaceId ?? this.currentSurfaceIdFor(scopeId));
		const animList = this.animations[sid] ?? [];
		const animById = new Map(animList.map((a) => [String(a.id), a]));

		const layers = [];
		for (const group of bindGroupsForScope(this.shellManifest, scopeId)) {
			if (
				!this.dressupState.get(dressupKey(scopeId, group.category, group.part))
			) {
				continue;
			}
			for (const animId of bindAnimationIds(group.number, group.add_ids)) {
				const anim = animById.get(String(animId));
				for (const pattern of anim?.patterns ?? []) {
					const file = patternSurfaceFile(
						this.resolveSurfaceNumber(pattern.surface, scopeId),
					);
					if (!file) continue;
					layers.push({
						file,
						x: pattern.x ?? 0,
						y: pattern.y ?? 0,
						type: pattern.type ?? "overlay",
					});
				}
			}
		}
		return layers;
	},

	/**
	 * 装着中 bindgroup に対応する bind アニメーションID列
	 * @this {import('./surface-manager.js').SurfaceManager}
	 */
	activeBindAnimationIds(scopeId = 0) {
		if (!this.shellManifest) return [];
		return bindGroupsForScope(this.shellManifest, scopeId)
			.filter((group) =>
				this.dressupState.get(dressupKey(scopeId, group.category, group.part)),
			)
			.flatMap((group) => bindAnimationIds(group.number, group.add_ids))
			.sort((a, b) => a - b);
	},

	/**
	 * planCache / baseCanvasCache のキー（scope + surface + 装着 bind 列）
	 * @this {import('./surface-manager.js').SurfaceManager}
	 */
	planCacheKey(surfaceId, scopeId = 0) {
		return `${scopeId}__${surfaceId}__${this.activeBindAnimationIds(scopeId).join(",")}`;
	},

	/**
	 * Rust 合成計画（element + 装着 bind pattern）を取得する
	 * @this {import('./surface-manager.js').SurfaceManager}
	 */
	async getCompositionPlan(surfaceId, scopeId = 0) {
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
			const plan = await invoke("surface_composition_plan", {
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

	/**
	 * Rust 合成計画をレガシー描画レイヤー列へ変換する
	 * @this {import('./surface-manager.js').SurfaceManager}
	 */
	planToRenderLayers(plan, scopeId = 0) {
		if (!plan?.layers?.length) return null;
		const elements = [];
		const bindLayers = [];
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
