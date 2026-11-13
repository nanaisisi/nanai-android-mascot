import {
	renderComplianceReportHtml,
	runAllUiComplianceProbes,
	type UiComplianceSuiteReport,
	wireManualCheckProgress,
} from "./spec-compliance-runner.js";

function buildCompliancePanelHtml(bodyHtml: string): string {
	return `
    <div class="test-menu-compliance">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:0.5rem;margin-bottom:0.5rem;">
        <h2 style="margin:0;font-size:1.05rem;">🧪 仕様適合・全使用部〜UI半自動検証</h2>
        <button type="button" id="test-menu-run-compliance-btn">再検証を実行</button>
      </div>
      <div id="test-menu-compliance-results">${bodyHtml}</div>
    </div>`;
}

export async function runSpecComplianceInTestMenu(): Promise<UiComplianceSuiteReport> {
	const modalText =
		typeof document !== "undefined"
			? document.getElementById("modal-text")
			: null;
	if (modalText) {
		modalText.innerHTML = buildCompliancePanelHtml(
			'<div class="info">⏳ 全使用部〜UI一括検証を実行中...</div>',
		);
	}

	const report = await runAllUiComplianceProbes();
	const reportHtml = renderComplianceReportHtml(report);

	if (modalText) {
		modalText.innerHTML = buildCompliancePanelHtml(reportHtml);
		wireManualCheckProgress(modalText, report.total);
	}

	if (typeof document !== "undefined") {
		const resultsEl = document.getElementById("test-menu-compliance-results");
		if (resultsEl && !resultsEl.innerHTML?.includes("compliance-report")) {
			resultsEl.innerHTML = reportHtml;
		}
		const rerunBtn = document.getElementById("test-menu-run-compliance-btn");
		rerunBtn?.addEventListener?.("click", () => {
			void runSpecComplianceInTestMenu();
		});
	}

	return report;
}

export function toggleMenu() {
	console.log("メニューボタンクリック");
	const dropdown = document.getElementById("dropdown");
	if (!dropdown) return;
	if (dropdown.classList.contains("show")) {
		dropdown.classList.remove("show");
		console.log("メニューを閉じました");
	} else {
		dropdown.classList.add("show");
		console.log("メニューを開きました");
	}
}

export function openModal(title: unknown) {
	console.log("モーダルを開きます:", title);
	const modalText = document.getElementById("modal-text");
	const modal = document.getElementById("modal");
	const dropdown = document.getElementById("dropdown");
	const modalContent = document.querySelector?.(".modal-content");

	if (title === "テスト") {
		modalContent?.classList?.add("compliance-wide");
		if (modal) {
			modal.classList.add("show");
		}
		if (dropdown) {
			dropdown.classList.remove("show");
		}
		void runSpecComplianceInTestMenu();
		return;
	}

	modalContent?.classList?.remove("compliance-wide");
	if (modalText) {
		modalText.textContent = `${title} の機能です`;
	}
	if (modal) {
		modal.classList.add("show");
	}
	if (dropdown) {
		dropdown.classList.remove("show");
	}
}

export function closeModal() {
	console.log("モーダルを閉じます");
	const modal = document.getElementById("modal");
	if (modal) {
		modal.classList.remove("show");
	}
}

// グローバルスコープに割り当て（HTMLのインラインonclick互換）
const globalScope = globalThis as unknown as Record<string, unknown>;
globalScope.toggleMenu = toggleMenu;
globalScope.openModal = openModal;
globalScope.closeModal = closeModal;
globalScope.runSpecComplianceInTestMenu = runSpecComplianceInTestMenu;

if (typeof document !== "undefined") {
	document
		.getElementById("launch-spec-compliance-btn")
		?.addEventListener?.("click", () => {
			openModal("テスト");
		});

	// メニュー外クリックで閉じる
	document.addEventListener("click", (e) => {
		const dropdown = document.getElementById("dropdown");
		const menuBtn = document.querySelector(".menu-btn");
		const targetNode = (e.target as Node | null) ?? null;

		if (dropdown && menuBtn) {
			if (!menuBtn.contains(targetNode) && !dropdown.contains(targetNode)) {
				dropdown.classList.remove("show");
			}
		}
	});

	// ESCキーでモーダルを閉じる
	document.addEventListener("keydown", (e) => {
		if (e.key === "Escape") {
			closeModal();
			const dropdown = document.getElementById("dropdown");
			if (dropdown) {
				dropdown.classList.remove("show");
			}
		}
	});
}

console.log("メニューテストページが読み込まれました");
