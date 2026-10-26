import { emit, invoke, isTauriAvailable } from "../core/tauri-helper.js";

/**
 * トークン列をバルーンにアニメーション再生（SakuraScriptPlayer.play の本体）
 *
 * @param {import('./sakura-script.js').SakuraScriptPlayer} player
 * @param {string} script
 */
export async function playScript(player, script) {
	const tokens = await player.parse(script);
	player.playbackId++;
	const currentId = player.playbackId;
	player.isPlaying = true;
	player.skipRequested = false;
	player.timeCritical = false; // 新しい再生で `\t` セクションをリセット
	player.currentScope = 0;

	const app = player.app;
	const sakuraText = app.elements.balloonText;
	const sakuraDisplay = app.elements.balloonDisplay;
	const keroText = app.elements.keroBalloonText;
	const keroDisplay = app.elements.keroBalloonDisplay;

	const hasTextContent = tokens.some(
		(t) =>
			t.type === "char" || t.type === "choice" || t.type === "anchor_begin",
	);

	// 発話文字や選択肢がある場合のみバルーンの内容を初期化・表示
	const shownScopes = new Set();
	if (hasTextContent) {
		sakuraText.innerHTML = "";
		if (keroText) keroText.innerHTML = "";
		if (!isTauriAvailable()) {
			sakuraDisplay.style.display = "block";
		}
		if (isTauriAvailable()) {
			shownScopes.add(0);
			const winPromises = [invoke("show_balloon_window", { scopeId: 0 }).catch(() => {})];
			// スクリプト内にスコープ1（\1 / \u）以降の発話・選択肢が含まれているか判定
			const hasKero = tokens.some((t) => t.type === "scope" && t.value >= 1);
			if (hasKero) {
				shownScopes.add(1);
				winPromises.push(invoke("show_balloon_window", { scopeId: 1 }).catch(() => {}));
			}
			await Promise.all(winPromises);
		}
	}

	let currentBalloonText = sakuraText;
	let isQuickMode = false;
	let ended = false;
	let currentAnchor = null;

	// 独立バルーン同期用ヘルパー
	// 同一ターン内（\_q のクイック描画など）の連続更新だけをまとめ、表示は遅延させない
	let syncPendingScopes = new Set();
	let syncQueued = false;
	const flushDesktopBalloon = () => {
		syncQueued = false;
		if (syncPendingScopes.size > 0 && isTauriAvailable()) {
			for (const sc of syncPendingScopes) {
				emit(`update-balloon-content-${sc}`, {
					html: (sc === 1 ? keroText : sakuraText)?.innerHTML || "",
					theme: app.currentBalloonTheme || "default",
				});
			}
			syncPendingScopes.clear();
		}
	};

	const scheduleDesktopBalloonSync = (immediate = false, targetScope = null) => {
		if (!isTauriAvailable()) return;
		const sc = targetScope ?? player.currentScope;
		syncPendingScopes.add(sc);
		if (immediate) {
			flushDesktopBalloon();
			return;
		}
		if (!syncQueued) {
			syncQueued = true;
			queueMicrotask(flushDesktopBalloon);
		}
	};

	for (let j = 0; j < tokens.length; j++) {
		if (player.playbackId !== currentId) break; // 新しい再生で中断
		if (ended) break; // \e 以降は再生しない（UKADOC準拠）

		const token = tokens[j];

		switch (token.type) {
			case "scope":
				player.currentScope = token.value;
				if (player.currentScope === 1) {
					if (!isTauriAvailable()) {
						if (app.elements.keroSlot) {
							app.elements.keroSlot.style.display = "flex";
						}
						if (keroDisplay && keroText) {
							keroDisplay.style.display = "block";
						}
					}
					currentBalloonText = keroText || sakuraText;
					if (isTauriAvailable() && hasTextContent && !shownScopes.has(1)) {
						shownScopes.add(1);
						invoke("show_balloon_window", { scopeId: 1 }).catch(() => {});
					}
				} else {
					if (!isTauriAvailable()) {
						if (app.elements.sakuraSlot) {
							app.elements.sakuraSlot.style.display = "flex";
						}
						sakuraDisplay.style.display = "block";
					}
					currentBalloonText = sakuraText;
					if (isTauriAvailable() && hasTextContent && !shownScopes.has(player.currentScope)) {
						shownScopes.add(player.currentScope);
						invoke("show_balloon_window", { scopeId: player.currentScope }).catch(() => {});
					}
				}
				break;

			case "char": {
				const span = document.createElement("span");
				span.textContent = token.value;
				if (player.currentFontStyles) {
					Object.assign(span.style, player.currentFontStyles);
				}
				if (currentAnchor) {
					currentAnchor.appendChild(span);
				} else {
					currentBalloonText.appendChild(span);
				}
				scheduleDesktopBalloonSync(false);

				// 文字送り時の口パク連動
				app.surfaceManager?.onCharSpoken(player.currentScope);

				if (!player.skipRequested && !isQuickMode) {
					await player.sleep(40);
				}
				break;
			}

			case "newline":
				if (token.half) {
					const halfBr = document.createElement("span");
					halfBr.style.display = "block";
					halfBr.style.height = "0.4em";
					currentBalloonText.appendChild(halfBr);
				} else {
					currentBalloonText.appendChild(document.createElement("br"));
				}
				scheduleDesktopBalloonSync(false);
				break;

			case "clear":
				currentBalloonText.innerHTML = "";
				scheduleDesktopBalloonSync(true);
				break;

			case "pause":
				// \x: クリックまたはタイムアウト待ち
				flushDesktopBalloon();
				if (!player.skipRequested && !isQuickMode) {
					const activeDisplay =
						player.currentScope === 1 ? keroDisplay : sakuraDisplay;
					await player.waitForClickOrTimeout(activeDisplay);
				}
				break;

			case "anchor_begin": {
				const anchorSpan = document.createElement("span");
				anchorSpan.className = "balloon-anchor";
				anchorSpan.dataset.anchorId = token.id;
				anchorSpan.setAttribute("data-anchor-id", token.id);
				anchorSpan.addEventListener("click", (e) => {
					e.stopPropagation();
					console.log(`🔗 アンカークリック: ${token.id}`);
					app.ghostController.sendShioriEvent("OnAnchorSelect", [
						token.id,
						...token.args,
					]);
				});
				currentBalloonText.appendChild(anchorSpan);
				currentAnchor = anchorSpan;
				scheduleDesktopBalloonSync(false);
				break;
			}

			case "anchor_end":
				currentAnchor = null;
				break;

			case "quick_toggle":
				// \_q / \_q[1] / \_q[0]: クイック描画制御
				if (typeof token.value === "boolean") {
					isQuickMode = token.value;
				} else {
					isQuickMode = !isQuickMode;
				}
				break;

			case "wait":
				if (!player.skipRequested && !isQuickMode) {
					await player.sleep(token.value);
				}
				break;

			case "surface":
				// 表情切り替え（スコープ別）
				app.ghostController.updateSurface(token.value, player.currentScope);
				break;

			case "animation":
				// \i[ID] / \i[ID,wait]: アニメーション直接再生
				await app.surfaceManager?.playAnimationById(
					token.animId,
					player.currentScope,
					token.wait,
				);
				break;

			case "choice": {
				const choiceBtn = document.createElement("button");
				choiceBtn.className = "balloon-choice-btn";
				choiceBtn.setAttribute("data-choice-id", token.id);
				choiceBtn.textContent = token.text;
				choiceBtn.addEventListener("click", (e) => {
					e.stopPropagation();
					player.onChoiceSelected(token.id, token.text);
				});
				currentBalloonText.appendChild(document.createElement("br"));
				currentBalloonText.appendChild(choiceBtn);
				flushDesktopBalloon();
				break;
			}

			case "balloon": {
				// \b[-1] でバルーン非表示、その他は表示
				const balloonDisplay =
					player.currentScope === 1 ? keroDisplay : sakuraDisplay;
				if (token.value === -1) {
					if (balloonDisplay) balloonDisplay.style.display = "none";
				} else {
					if (balloonDisplay) balloonDisplay.style.display = "block";
				}
				break;
			}

			case "timeout":
				// \t: タイムクリティカルセクション (UKADOC準拠)。
				// スクリプトブレーク（選択肢選択・ダブルクリック中断）か \e まで
				// マウス系イベント通知を抑止する。
				player.timeCritical = true;
				break;

			case "halt":
				// \-: ゴースト終了
				await app.ghostController?.closeGhost?.();
				break;

			case "offset": {
				// \_l[x,y] バルーン内座標オフセット指定（spanのstyle指定で実現）
				const spacer = document.createElement("span");
				spacer.style.display = "inline-block";
				if (token.x.startsWith("@")) {
					spacer.style.marginLeft = `${token.x.slice(1)}px`;
				} else {
					spacer.style.position = "relative";
					spacer.style.left = `${token.x}px`;
				}
				if (token.y.startsWith("@")) {
					spacer.style.marginTop = `${token.y.slice(1)}px`;
				} else {
					spacer.style.top = `${token.y}px`;
				}
				currentBalloonText.appendChild(spacer);
				scheduleDesktopBalloonSync(false);
				break;
			}

			case "font": {
				// \f[color,red], \f[bold,1], \f[italic,1], \f[height,14], \f[strike,1], \f[underline,1], \f[shadow,color], \f[default]
				player.currentFontStyles = player.currentFontStyles || {};
				if (token.tag === "default") {
					player.currentFontStyles = {};
				} else if (token.tag === "color") {
					if (token.param) player.currentFontStyles.color = token.param;
					else delete player.currentFontStyles.color;
				} else if (token.tag === "bold") {
					player.currentFontStyles.fontWeight =
						token.param === "0" || token.param === "false" ? "normal" : "bold";
				} else if (token.tag === "italic") {
					player.currentFontStyles.fontStyle =
						token.param === "0" || token.param === "false" ? "normal" : "italic";
				} else if (token.tag === "strike") {
					player.currentFontStyles.textDecoration =
						token.param === "0" || token.param === "false" ? "none" : "line-through";
				} else if (token.tag === "underline") {
					player.currentFontStyles.textDecoration =
						token.param === "0" || token.param === "false" ? "none" : "underline";
				} else if (token.tag === "height") {
					if (token.param) {
						const size = token.param.endsWith("px") || token.param.endsWith("pt") || token.param.endsWith("em")
							? token.param
							: `${token.param}px`;
						player.currentFontStyles.fontSize = size;
					}
				} else if (token.tag === "shadow") {
					if (token.param === "0" || token.param === "none") {
						delete player.currentFontStyles.textShadow;
					} else {
						const col = token.param || "rgba(0,0,0,0.5)";
						player.currentFontStyles.textShadow = `1px 1px 2px ${col}`;
					}
				} else if (token.tag === "name" && token.param) {
					player.currentFontStyles.fontFamily = token.param;
				}
				break;
			}

			case "sync_toggle":
				// \_s / \_s[1] / \_s[0]: 複数キャラ同時発話モード
				if (typeof token.value === "boolean") {
					player.isSyncMode = token.value;
				} else {
					player.isSyncMode = !player.isSyncMode;
				}
				break;

			case "command":
				await player.commandHandler.runCommand(token.args);
				break;

			case "end":
				// \e: スクリプト終了（以降のトークンは再生しない）
				ended = true;
				break;
		}
	}

	flushDesktopBalloon();
	player.isPlaying = false;
	player.scheduleSurfaceRestore(currentId);
}
