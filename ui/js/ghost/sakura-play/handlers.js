import { invoke, isTauriAvailable } from "../../core/tauri-helper.js";

export async function handleToken(player, app, token, context) {
	const {
		sakuraText,
		keroText,
		sakuraDisplay,
		keroDisplay,
		hasTextContent,
		shownScopes,
		flushDesktopBalloon,
		scheduleDesktopBalloonSync,
	} = context;

	let { currentBalloonText, isQuickMode, ended, currentAnchor } = context;

	switch (token.type) {
		case "scope":
			player.currentScope = token.value;
			if (player.currentScope === 1) {
				app.surfaceManager?.onTalkEnd(0);
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
					invoke("show_balloon_window", {
						scopeId: 1,
						theme: app.currentBalloonTheme,
					}).catch(() => {});
				}
			} else {
				app.surfaceManager?.onTalkEnd(1);
				if (!isTauriAvailable()) {
					if (app.elements.sakuraSlot) {
						app.elements.sakuraSlot.style.display = "flex";
					}
					sakuraDisplay.style.display = "block";
				}
				currentBalloonText = sakuraText;
				if (
					isTauriAvailable() &&
					hasTextContent &&
					!shownScopes.has(player.currentScope)
				) {
					shownScopes.add(player.currentScope);
					invoke("show_balloon_window", {
						scopeId: player.currentScope,
						theme: app.currentBalloonTheme,
					}).catch(() => {});
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
			if (token.mode === "char") {
				const count = Math.max(1, token.count || 1);
				let removed = 0;
				while (removed < count && currentBalloonText.lastChild) {
					const lastNode = currentBalloonText.lastChild;
					if (lastNode.nodeType === Node.TEXT_NODE) {
						const text = lastNode.nodeValue || "";
						if (text.length <= count - removed) {
							removed += text.length;
							currentBalloonText.removeChild(lastNode);
						} else {
							lastNode.nodeValue = text.slice(0, -(count - removed));
							removed = count;
						}
					} else {
						// Element node (e.g. span, br, img)
						currentBalloonText.removeChild(lastNode);
						removed++;
					}
				}
			} else if (token.mode === "line") {
				const count = Math.max(1, token.count || 1);
				let removedLines = 0;
				while (removedLines < count && currentBalloonText.lastChild) {
					const lastNode = currentBalloonText.lastChild;
					const isBr =
						lastNode.nodeName === "BR" ||
						(lastNode.nodeName === "SPAN" &&
							lastNode.style?.display === "block");
					currentBalloonText.removeChild(lastNode);
					if (isBr) {
						removedLines++;
					}
				}
			} else {
				currentBalloonText.innerHTML = "";
			}
			scheduleDesktopBalloonSync(true);
			break;

		case "pause":
			flushDesktopBalloon();
			if (!player.skipRequested && !isQuickMode) {
				const activeDisplay =
					player.currentScope === 1 ? keroDisplay : sakuraDisplay;
				await player.waitForClickOrTimeout(activeDisplay);
			}
			if (!token.noClear) {
				// \x: クリック後にスコープをリセット (\0)、フォント装飾を解除、バルーン内容をクリア
				currentBalloonText.innerHTML = "";
				player.currentScope = 0;
				currentBalloonText = sakuraText;
				player.currentFontStyles = {};
				scheduleDesktopBalloonSync(true);
			}
			break;

		case "anchor_begin": {
			const anchorSpan = document.createElement("span");
			anchorSpan.className = "balloon-anchor";
			anchorSpan.dataset.anchorId = token.id;
			anchorSpan.setAttribute("data-anchor-id", token.id);
			anchorSpan.addEventListener("click", (e) => {
				e.stopPropagation();
				app.ghostController.sendShioriEvent("OnAnchorSelect", [
					token.id,
					...(token.args || []),
				]);
			});
			anchorSpan.addEventListener("mouseenter", () => {
				app.ghostController?.sendShioriEvent("OnAnchorEnter", [
					anchorSpan.textContent || token.id,
					token.id,
					...(token.args || []),
				]);
			});
			anchorSpan.addEventListener("mouseleave", () => {
				app.ghostController?.sendShioriEvent("OnAnchorEnter", []);
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
			app.ghostController.updateSurface(token.value, player.currentScope);
			break;

		case "animation":
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
				if (player.choiceTimeoutTimer) {
					clearTimeout(player.choiceTimeoutTimer);
					player.choiceTimeoutTimer = null;
				}
				player.onChoiceSelected(token.id, token.text);
			});
			choiceBtn.addEventListener("mouseenter", () => {
				app.ghostController?.sendShioriEvent("OnChoiceEnter", [
					token.text,
					token.id,
					...(token.args || []),
				]);
			});
			choiceBtn.addEventListener("mouseleave", () => {
				app.ghostController?.sendShioriEvent("OnChoiceEnter", []);
			});
			currentBalloonText.appendChild(document.createElement("br"));
			currentBalloonText.appendChild(choiceBtn);
			flushDesktopBalloon();

			if (player.choiceTimeout > 0 && !player.choiceTimeoutTimer) {
				player.choiceTimeoutTimer = setTimeout(() => {
					player.onChoiceTimeout();
				}, player.choiceTimeout);
			}
			break;
		}

		case "balloon": {
			const balloonDisplay =
				player.currentScope === 1 ? keroDisplay : sakuraDisplay;
			if (token.value === -1) {
				if (balloonDisplay) balloonDisplay.style.display = "none";
			} else {
				if (balloonDisplay) balloonDisplay.style.display = "block";
			}
			break;
		}

		case "inline_bitmap": {
			const img = document.createElement("img");
			img.className = "balloon-inline-bitmap";
			const themeName = app.currentBalloonTheme || "default";
			const rawPath = token.path || "";
			const fullPath =
				rawPath.startsWith("data:") ||
				rawPath.startsWith("http://") ||
				rawPath.startsWith("https://")
					? rawPath
					: `assets/balloon/${themeName}/${rawPath}`;
			img.src = globalThis.__TAURI__?.core?.convertFileSrc
				? globalThis.__TAURI__.core.convertFileSrc(fullPath)
				: fullPath;
			img.style.display = "inline-block";
			img.style.verticalAlign = "middle";
			img.style.maxHeight = "1.2em";
			img.style.width = "auto";
			if (token.mode === "inline" || !token.mode) {
				currentBalloonText.appendChild(img);
			} else {
				if (token.x !== undefined) img.style.left = `${token.x}px`;
				if (token.y !== undefined) img.style.top = `${token.y}px`;
				img.style.position = "absolute";
				currentBalloonText.appendChild(img);
			}
			scheduleDesktopBalloonSync(false);
			break;
		}

		case "timeout":
			player.timeCritical = true;
			break;

		case "choice_timeout":
			player.choiceTimeout = token.timeout;
			break;

		case "balloon_timeout":
			player.balloonTimeout = token.timeout;
			break;

		case "halt":
			await app.ghostController?.closeGhost?.();
			break;

		case "offset": {
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
					token.param === "0" || token.param === "false"
						? "none"
						: "line-through";
			} else if (token.tag === "underline") {
				player.currentFontStyles.textDecoration =
					token.param === "0" || token.param === "false" ? "none" : "underline";
			} else if (token.tag === "height") {
				if (token.param) {
					const size =
						token.param.endsWith("px") ||
						token.param.endsWith("pt") ||
						token.param.endsWith("em")
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
			app.surfaceManager?.onTalkEnd(player.currentScope);
			app.surfaceManager?.onScriptEnd(0);
			app.surfaceManager?.onScriptEnd(1);
			ended = true;
			break;
	}

	context.currentBalloonText = currentBalloonText;
	context.isQuickMode = isQuickMode;
	context.ended = ended;
	context.currentAnchor = currentAnchor;
}
