import { runBalloonLayoutProbe, runBalloonFontAssetsProbe, runSakuraScriptTokensProbe, runSurfaceScopeCollisionProbe } from "./balloon-probes.js";
import { runMouseShioriEventProbe, runSystemDialogUiProbe } from "./interactive-probes.js";
import { escapeHtml, type UiComplianceProbeResult, type UiComplianceSuiteReport } from "./types.js";

export async function runAllUiComplianceProbes(
	rootElement?: HTMLElement,
): Promise<UiComplianceSuiteReport> {
	const results: UiComplianceProbeResult[] = [
		runBalloonLayoutProbe(rootElement),
		runBalloonFontAssetsProbe(rootElement),
		runSakuraScriptTokensProbe(),
		runSurfaceScopeCollisionProbe(),
		await runMouseShioriEventProbe(),
		await runSystemDialogUiProbe(),
	];

	const total = results.length;
	const passed = results.filter((r) => r.passed).length;
	const failed = total - passed;
	const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;

	return {
		total,
		passed,
		failed,
		passRate,
		results,
		timestamp: new Date().toISOString(),
	};
}

export function renderComplianceReportHtml(
	report: UiComplianceSuiteReport,
): string {
	const rowsHtml = report.results
		.map((r) => {
			const statusBadge = r.passed
				? '<span class="compliance-status pass">✅ PASS</span>'
				: '<span class="compliance-status fail">❌ FAIL</span>';
			const idEsc = escapeHtml(r.id);
			return `
        <tr class="compliance-row ${r.passed ? "compliance-probe-pass" : "compliance-probe-fail"}">
          <td>
            <div class="compliance-category">${escapeHtml(r.category)}</div>
            <div class="compliance-spec"><strong>${escapeHtml(r.specName)}</strong></div>
            <div class="compliance-usage"><code>${escapeHtml(r.usagePath)}</code></div>
          </td>
          <td>
            <div>${statusBadge}</div>
            <div class="compliance-actual">${escapeHtml(r.actualSummary)}</div>
          </td>
          <td>
            <label class="compliance-manual-label">
              <input type="checkbox" class="manual-verify-check" data-probe-id="${idEsc}" />
              目視確認済
            </label>
            <div class="compliance-hint">${escapeHtml(r.manualCheckHint)}</div>
          </td>
        </tr>`;
		})
		.join("");

	return `
    <div class="compliance-report">
      <div class="compliance-summary" style="display:flex;flex-wrap:wrap;gap:0.5rem;align-items:center;margin-bottom:0.75rem;">
        <span class="compliance-badge">合計: <strong>${report.total}</strong></span>
        <span class="compliance-badge pass">合格: <strong>${report.passed}</strong></span>
        <span class="compliance-badge fail">失敗: <strong>${report.failed}</strong></span>
        <span class="compliance-badge rate">適合率: <strong>${report.passRate}%</strong></span>
        <span class="compliance-badge manual" id="manual-verify-progress">目視確認: 0 / ${report.total}</span>
        <span class="compliance-timestamp" style="font-size:0.75rem;color:#666;">${escapeHtml(report.timestamp)}</span>
      </div>
      <div class="compliance-table-wrap" style="overflow-x:auto;">
        <table class="compliance-table" style="width:100%;border-collapse:collapse;font-size:0.78rem;">
          <thead>
            <tr>
              <th style="text-align:left;border-bottom:1px solid #ccc;padding:0.35rem;">仕様・使用経路</th>
              <th style="text-align:left;border-bottom:1px solid #ccc;padding:0.35rem;">自動検証結果</th>
              <th style="text-align:left;border-bottom:1px solid #ccc;padding:0.35rem;">UI目視確認</th>
            </tr>
          </thead>
          <tbody>${rowsHtml}</tbody>
        </table>
      </div>
    </div>`;
}
