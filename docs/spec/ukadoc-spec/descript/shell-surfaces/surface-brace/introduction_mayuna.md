# 着せ替え（MAYUNA）

- **規格**: [introduction_mayuna.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/introduction_mayuna/) (ukadoc-spec/descript/shell-surfaces/surface-brace/introduction_mayuna.md)
- **検索語**: MAYUNA
- **対応状況**: ⚠️ 一部対応 (Rust `crates/ui/src/surfaces.rs` plan_composition で bind レイヤー計画 / 描画反映は別レイヤー)
  - 描画反映の接続設計は [ghost/composition-plan-integration-spec.md](../../../ghost/composition-plan-integration-spec.md) 参照

## 突合結果

実装コードに「MAYUNA」が見つからない。

## 実装箇所

- `crates/ui/src/surfaces/types/composition.rs:1` `//! 合成計画 (MAYUNA) の型`
- `crates/ui/src/surfaces/types/txt.rs:42` `/// 合成計画（MAYUNA / 着せ替え表示のレイヤー列）を立てる`
