# stop,ID

- **規格**: [stop.md](https://ukatech.shillest.net/ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/stop/) (ukadoc-spec/descript/shell-surfaces/surface-brace/h-animationinterval/stop.md)
- **検索語**: stop
- **対応状況**: ✅ 実装済


## 実装箇所

- `crates/nanai-surface/src/parser/handlers/animation.rs:86` `|| first == "stop"`
- `ui/ts/core/actions/dictation.ts:16` `stop(): void;`
- `ui/ts/ui/touch/bridge/constants.ts:13` `STOP: "nam:android:stop",`
- `tests/command-handler-modules.test.ts:55` `it("handles anim commands (pause, resume, stop, clear, offset)", async () => {`
- `crates/nanai-surface/src/types/draw/method.rs:80` `s if s.starts_with("stop") => {`
- `ui/ts/core/actions/dictation.ts:82` `this.recognition.stop();`
