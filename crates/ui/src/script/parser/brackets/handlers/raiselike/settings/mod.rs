//! 設定系ブラケットコマンドハンドラーモジュール

mod handlers;

#[cfg(test)]
mod tests;

pub(crate) use handlers::handle_setting_command;
