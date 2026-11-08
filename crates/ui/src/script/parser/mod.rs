//! さくらスクリプトのパーサと実行（内部コマンド）モジュール

pub mod brackets;
pub mod executor;

#[cfg(test)]
mod tests;

use super::command::SakuraCommand;
pub use executor::execute_sakura_script;

/// さくらスクリプトをパースして SakuraCommand のリストとして返す
pub fn parse_sakura_script(script: &str) -> Vec<SakuraCommand> {
    let mut commands = Vec::new();
    execute_sakura_script(script, |cmd| commands.push(cmd));
    commands
}
