# アニメーション（SERIKO）

- **規格**: [introduction_seriko.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/introduction_seriko/) (ukadoc-spec/descript/shell-surfaces/surface-brace/introduction_seriko.md)
- **検索語**: SERIKO
- **対応状況**: 📝 コメントのみ(未実装の可能性大)

## 突合結果

実装コードに「SERIKO」が出現。実際の処理内容は未精査。

## 実装箇所

- `crates/ui/src/manifest.rs:5` `//! element 合成・SERIKO 再生・当たり判定・着せ替え描画を行う。`
- `crates/ui/src/shell.rs:20` `/// `surfaces.txt`（Element / SERIKO / Collision）`
- `crates/ui/src/animation/mod.rs:1` `//! SERIKO アニメーション実行器モジュール`
- `crates/ui/src/animation/timeline.rs:1` `//! SERIKO アニメーション実行器（ukadoc-spec / descript / shell-surfaces 準拠）`
- `crates/ui/src/surfaces/mod.rs:3` `//! シェルのサーフィス定義（Element 描画 / SERIKO アニメーション / Collision 当たり判定 /`
