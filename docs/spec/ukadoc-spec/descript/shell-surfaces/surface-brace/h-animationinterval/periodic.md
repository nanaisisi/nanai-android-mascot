# periodic,数値

- **規格**: [periodic.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/periodic/) (ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/periodic.md)
- **検索語**: periodic
- **対応状況**: ✅ 実装済

## 突合結果

surface-animation-manager.js で interval 種別として処理している。

## 実装箇所

- `crates/ui/src/animation.rs:101` `/// `periodic,N`（一定周期ミリ秒）の周期`
- `crates/ui/src/animation.rs:102` `pub fn periodic_ms(&self) -> Option<u32> {`
- `crates/ui/src/animation.rs:124` `/// - `always`/`runonce`/`periodic,N`: 周期到来で発火 (`elapsed >= n` 又は即時)`
- `crates/ui/src/animation.rs:131` `if let Some(period) = self.periodic_ms() {`
- `crates/ui/src/animation.rs:132` `// periodic,N: 一定周期到来で発火`
