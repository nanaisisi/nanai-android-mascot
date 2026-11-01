# Task: Slot-04 Sakura Script Tag Expansion

**Status**: TODO
**Domain**: Domain 2 (スクリプト解析 & 実行エンジン)
**Ownership**: `crates/ui/src/script/`, `ui/js/ghost/parser/` (Do not edit outside these directories!)
**Context**: 
Jules, implement missing Sakura Script tags parser support based on `docs/doc/nas-spec/shiori-script/sakura-script-and-balloon-spec/` specification.
Focus on tags: `\w1`~`\w9`, `\_w[N]`, `\q[Label,ID]`. 

**Goal**:
1. Ensure the Rust tokenizer in `crates/ui/src/script/parser/` correctly handles numeric wait tags (`\w[1-9]`) and arbitrary wait tags (`\_w[500]`).
2. Implement choice button tag parsing `\q[label,id]`.
3. Add Vitest/Cargo tests to verify output AST nodes.

**Constraint**:
Do not format files globally. Only format the specific files you touched.