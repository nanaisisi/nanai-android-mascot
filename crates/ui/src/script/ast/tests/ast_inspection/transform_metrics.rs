//! AST マッピング変換、テキスト抽出、および構造メトリクス (node_count, depth) テスト

use super::super::*;

#[test]
fn test_ast_cycle10_map_commands_extract_text_and_diagnostics() {
    let commands = vec![
        SakuraCommand::Target(0),
        SakuraCommand::Surface(0),
        SakuraCommand::Text("Hello, ".into()),
        SakuraCommand::Anchor {
            id: "world_link".into(),
            text: "World".into(),
            args: vec![],
        },
        SakuraCommand::Wait(500),
        SakuraCommand::Choice {
            label: "!".into(),
            id: "excl".into(),
            args: vec![],
        },
    ];
    let ast = build_sakura_ast(&commands);

    let text = ast.extract_text();
    assert_eq!(text, "Hello, World!");

    assert_eq!(ast.node_count(), 8);
    assert_eq!(ast.depth(), 4);

    let mapped_ast = ast.map_commands(&|cmd| match cmd {
        SakuraCommand::Wait(_) => SakuraCommand::Wait(10),
        other => other.clone(),
    });
    let collected = mapped_ast.collect_commands();
    assert!(
        collected
            .iter()
            .any(|c| matches!(c, SakuraCommand::Wait(10)))
    );
    assert!(
        !collected
            .iter()
            .any(|c| matches!(c, SakuraCommand::Wait(500)))
    );
}
