import { runStepCommand } from "./config.ts";

export function runSpecAuditVerification(): void {
	console.log(
		"3️⃣ [Spec Compliance & Layer Audit] UKADOC/SSP 仕様適合・レイヤー到達度・実装対照リスト監査...",
	);
	const auditOk = runStepCommand(
		"python scripts/verify_spec_compliance.py --dry-run --check-layers --check-lists",
		"",
		"❌ Spec Compliance Audit: verify_spec_compliance.py でエラーが発生しました。",
	);
	const auditTestOk = runStepCommand(
		"python -m unittest discover tests",
		"",
		"❌ Spec Compliance Unit Tests: Python unit tests failed.",
	);
	if (auditOk && auditTestOk) {
		console.log(
			"✅ Spec Compliance & Layer Audit: 仕様適合・レイヤー到達度・実装対照リスト監査および単体テスト通過!\n",
		);
	} else {
		console.log("");
	}
}
