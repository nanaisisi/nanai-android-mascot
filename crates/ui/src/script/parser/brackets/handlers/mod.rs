//! さくらスクリプト括弧コマンドハンドラー

mod basic;
mod raiselike;
mod underscore;

pub(crate) use basic::{
    handle_animation, handle_balloon, handle_choice, handle_font, handle_newline,
    handle_surface, handle_target_p, handle_wait_short,
};
pub(crate) use raiselike::handle_raiselike;
pub(crate) use underscore::handle_underscore;
