/**
 * @file modal-explorer.js
 * @brief ゴーストエクスプローラモーダルのリスナーおよびテーブル描画・操作ロジック
 */
export function setupExplorerListeners(modalManager, app) {
	const rows = modalManager.content?.querySelector("#explorer-rows");
	const status = modalManager.content?.querySelector("#explorer-status");
	const search = modalManager.content?.querySelector("#explorer-search");
	let ghosts = [];
	let selected = null;
	let sortKey = "name";
	let sortAsc = true;
	let _searchIndex = -1;

	const format = (value) => value || "—";
	const updateSortHeaderIndicators = () => {
		modalManager.content
			?.querySelectorAll("th[data-sort]")
			.forEach((header) => {
				const baseLabel =
					header.dataset.label || header.textContent.replace(/ [▲▼]$/, "");
				header.dataset.label = baseLabel;
				if (header.dataset.sort === sortKey) {
					header.textContent = `${baseLabel} ${sortAsc ? "▲" : "▼"}`;
				} else {
					header.textContent = baseLabel;
				}
			});
	};
	const render = () => {
		if (!rows) return;
		updateSortHeaderIndicators();
		const query = String(search?.value || "")
			.trim()
			.toLowerCase();
		const list = ghosts
			.filter((ghost) =>
				[ghost.name, ghost.craftman, ghost.path].some((value) =>
					String(value || "")
						.toLowerCase()
						.includes(query),
				),
			)
			.sort((a, b) => {
				const left = String(a[sortKey] || "");
				const right = String(b[sortKey] || "");
				return (
					(left.localeCompare(right, "ja") ||
						a.name.localeCompare(b.name, "ja")) * (sortAsc ? 1 : -1)
				);
			});
		rows.innerHTML = "";
		list.forEach((ghost) => {
			const tr = document.createElement("tr");
			tr.className = ghost.name === selected?.name ? "is-selected" : "";
			tr.innerHTML = [
				ghost.name,
				ghost.craftman,
				ghost.path,
				ghost.group,
				ghost.install_date,
				ghost.update_date,
				ghost.update_result,
				ghost.sakura_name,
				ghost.kero_name,
			]
				.map(
					(value) =>
						`<td title="${String(value || "").replaceAll('"', "&quot;")}">${format(value)}</td>`,
				)
				.join("");
			tr.addEventListener("click", () => {
				selected = ghost;
				render();
			});
			tr.addEventListener("dblclick", async () => {
				await app.ghostController.selectGhost(ghost.name);
				modalManager.hide();
			});
			rows.appendChild(tr);
		});
		if (status) status.textContent = `${list.length} 件`;
	};
	const load = async () => {
		ghosts = (await app.ghostController.scanGhosts()) || [];
		selected =
			ghosts.find(
				(ghost) => ghost.name === app.ghostController.currentGhost?.name,
			) ||
			ghosts[0] ||
			null;
		render();
	};
	modalManager.content
		?.querySelector("#explorer-refresh-btn")
		?.addEventListener("click", load);
	search?.addEventListener("input", () => {
		_searchIndex = -1;
		render();
	});

	modalManager.content?.querySelectorAll("th[data-sort]").forEach((th) => {
		th.addEventListener("click", () => {
			const key = th.dataset.sort;
			if (!key) return;
			if (sortKey === key) {
				sortAsc = !sortAsc;
			} else {
				sortKey = key;
				sortAsc = true;
			}
			render();
		});
	});

	modalManager.content
		?.querySelector("#explorer-switch-btn")
		?.addEventListener("click", async () => {
			if (!selected) return;
			await app.ghostController.selectGhost(selected.name);
			modalManager.hide();
		});

	modalManager.content
		?.querySelector("#explorer-close-btn")
		?.addEventListener("click", () => modalManager.hide());

	load();
}
