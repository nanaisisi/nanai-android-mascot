# 用語説明

- **規格**: [about/reference.md](https://ukatech.shillest.net/ukadoc-ssp/about/reference/) (ukadoc-ssp/about/reference.md)
- **対応状況**: ✅ 実装済

## 突合結果

伺か専門用語（ゴースト、シェル、バルーン、SHIORI等）の解説

## 実装箇所

- `src-tauri/src/sstp.rs:17` `pub references: HashMap<String, String>,`
- `src-tauri/src/sstp.rs:26` `pub reference0: Option<String>,`
- `src-tauri/src/sstp.rs:52` `let mut references = HashMap::new();`
- `src-tauri/src/sstp.rs:72` `references.insert(key.to_string(), val);`
- `src-tauri/src/sstp.rs:87` `references,`
