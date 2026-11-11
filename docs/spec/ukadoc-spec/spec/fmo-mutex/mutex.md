# fmo-mutex : Mutex

- **規格**: [mutex.md](https://ukatech.shillest.net/ukadoc-spec/spec/fmo-mutex/mutex/) (ukadoc-spec/spec/fmo-mutex/mutex.md)
- **対応状況**: ⚠️ 一部対応

## 突合結果

ベースウェア識別用の名前付き Mutex なし。

## 実装箇所

- `tests/sakura-play/sync-object.test.ts:29` `const sync = new SyncObject("mutex");`
