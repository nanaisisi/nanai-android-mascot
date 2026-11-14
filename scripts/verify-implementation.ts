/**
 * @file verify-implementation.ts
 * @brief 実装確認スクリプト - Rustビルド、全Vitest単体テスト、UKADOC仕様準拠・レイヤー監査、モジュール確認、ライセンス更新 & UI半自動確認ガイドを一括検証
 */

import { runBuildAndTestVerification } from "./verification/build-and-test.ts";
import { getHasError } from "./verification/config.ts";
import { runLicensesAndGuide } from "./verification/licenses-and-guide.ts";
import { runListAndComparisonAudit } from "./verification/list-audit.ts";
import { runModuleExistenceCheck } from "./verification/module-check.ts";
import { runSpecAuditVerification } from "./verification/spec-audit.ts";

console.log("==================================================");
console.log("🚀 Nanai Android Mascot - 実装確認スクリプト");
console.log("==================================================\n");

runBuildAndTestVerification();
runSpecAuditVerification();
runModuleExistenceCheck();
runListAndComparisonAudit();
runLicensesAndGuide();

console.log("==================================================");
if (getHasError()) {
	console.error("❌ 実装確認: いくつかの検証項目で失敗が発生しました。");
	process.exit(1);
} else {
	console.log(
		"✨ 実装確認完了: すべてのコンパイル・テスト・モジュール・監査が正常です！",
	);
	process.exit(0);
}
