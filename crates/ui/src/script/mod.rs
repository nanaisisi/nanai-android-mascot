pub mod command;
pub mod env;
pub mod parser;

pub use command::SakuraCommand;
pub use env::expand_sakura_script_env;
pub use parser::{execute_sakura_script, parse_sakura_script};

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_script_reexports() {
        let cmd = SakuraCommand::Text("test".into());
        assert_eq!(cmd, SakuraCommand::Text("test".into()));
        let cmds = parse_sakura_script("Hello %username");
        assert!(!cmds.is_empty());
    }
}
