# 伺か仕様適合実装計画 (ukadoc-spec & ukadoc-ssp)

コミュニティ公式の仕様書（ukadoc）およびサマリ（`@SUMMARY.md`）に基づき、共有コードの中心となるクレート（`nanai-core`, `nanai-shiori-vm` 等）において、未実装・一部対応となっている伺か仕様の適合実装を行います。

## ユーザー Review Required

> [!IMPORTANT]
> 優先して実装すべき記述子（descript.txtなど）やイベント、プロパティの具体的なサブカテゴリについて、ご希望の領域（例: バルーン設定、ゴースト設定、SHIORIイベント定義など）があればお知らせください。

## Open Questions

- 特になし。基本方針として `nanai-core` のプロパティ・設定パース機能と、`nanai-shiori-vm` のイベントハンドリング・SHIORI仕様適合を順次拡充します。

## Proposed Changes

### nanai-core (共有コモディティ / Descript & 共通仕様パース)
- ゴースト、バルーン、シェル等の `descript.txt` 記述子プロパティの拡張・反映
- 一部対応・未実装となっている設定項目のパースおよびバリデーション強化

### nanai-shiori-vm (SHIORI / イベント仕様適合)
- 各種SHIORIイベント（ukadoc-spec/list の未実装・一部対応イベント）の定義およびディスパッチ処理の拡充
- プロパティシステム・SSTP・FMO等の関連仕様の適合

## Verification Plan

### Automated Tests
- 各クレートにおけるユニットテスト（`cargo test`）の実行による既存機能の破壊がないことの確認
- 新規追加したパース処理・イベント処理に対するテストコードの追加

### Manual Verification
- ビルド確認（`cargo build`）
