# 有効テキスト領域 (`validrect.*`)

- **対応状況**: ✅ 実装済

`validrect.left`, `validrect.top`, `validrect.right`, `validrect.bottom` を用いたバルーンウィンドウのパディング（有効描画領域）制御。


## 実装箇所

- `crates/ui/src/descript/parser.rs:77` `/// バルーン有効テキスト領域 (validrect.left, top, right, bottom)`
- `crates/ui/src/descript/parser.rs:78` `pub fn validrect(&self) -> (Option<i32>, Option<i32>, Option<i32>, Option<i32>) `
- `crates/ui/src/descript/parser.rs:79` `let l = self.get("validrect.left").and_then(|v| v.parse().ok());`
- `crates/ui/src/descript/parser.rs:80` `let t = self.get("validrect.top").and_then(|v| v.parse().ok());`
- `crates/ui/src/descript/parser.rs:81` `let r = self.get("validrect.right").and_then(|v| v.parse().ok());`
