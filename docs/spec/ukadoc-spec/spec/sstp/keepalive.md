# sstp : keep-alive

- **規格**: [keepalive.md](https://ukatech.shillest.net/ukadoc-spec/spec/sstp/keepalive/) (ukadoc-spec/spec/sstp/keepalive.md)
- **対応状況**: ⚠️ 一部対応

## 突合結果

SSTP 未対応。

## 実装箇所

- `crates/ui/src/sstp/message/request/parser.rs:117` `} else if key_lower == "keepalive" {`
