pub mod animation;
pub mod app;
#[path = "resources/descript/mod.rs"]
pub mod descript;
pub mod fmo;
pub mod interface;
#[path = "resources/manifest/mod.rs"]
pub mod manifest;
pub mod script;
#[path = "resources/shell/mod.rs"]
pub mod shell;
pub mod shiori;
pub mod sstp;
#[path = "surfaces/surfaces_core.rs"]
pub mod surfaces_core;
#[path = "surfaces/surfaces_core_core.rs"]
pub mod surfaces_core_core;
#[path = "surfaces/surfaces_core_integration.rs"]
pub mod surfaces_core_integration;
#[path = "surfaces/surfaces_integration.rs"]
pub mod surfaces_integration;
#[path = "resources/surfacetable/mod.rs"]
pub mod surfacetable;
pub mod update;
#[path = "vfs/vfs_core.rs"]
pub mod vfs_core;
#[path = "vfs/vfs_integration.rs"]
pub mod vfs_integration;

pub use interface::{Nanai_android_mascot_uiInterface, NanaiUiFacade};

// 外部公開 API の再エクスポート
pub use animation::{
    ActiveAnimation, AnimationScheduler, FrameStepEvent, ScheduledFrame, Timeline, build_timeline,
    cycle_len_ms,
};
pub use descript::{BindGroup, BindOptionGroup, CharDefaults, Descript};
pub use fmo::{
    FmoEntry, FmoRecord, MUTEX_SAKURA, MUTEX_SAKURA_FMO, MUTEX_SAKURA_UNICODE_FMO, MUTEX_SSP,
    generate_fmo_buffer, parse_fmo_buffer,
};
pub use manifest::{ShellManifest, SurfaceManifest};
pub use script::{
    SakuraAstNode, SakuraCommand, SakuraScriptLifetime, SakuraToken, build_sakura_ast,
    execute_sakura_script, parse_sakura_script,
};
pub use shell::Shell;
pub use shiori::{
    CandidateKind, ErrorLevel, GhostStatusToken, LoadAttempt, MockShioriEngine,
    MultiStageShioriLoader, SecurityLevel, SenderTypeTag, ShioriEngine, ShioriEngineCandidate,
    ShioriLifecycleState, ShioriMethod, ShioriRequest, ShioriResponse, StatusCode,
    build_standard_capability_references, parse_sender_types,
};
pub use sstp::{IfGhostEntry, SstpMessage, SstpMethod, SstpRequest, SstpResponse, SstpStatusCode};
pub use surfaces_core::{
    BalloonOffset, CollisionArea, CollisionShape, CompositionLayer, CompositionPlan, DrawMethod,
    ElementDef, HitTestResult, Interval, SerikoAnimation, SortKind, SurfacesTxt,
};
pub use surfaces_integration::parse_surfaces_txt;
pub use surfacetable::{
    SurfTableEntry, SurfTableGroup, SurfaceTable, is_parts_name, parse_surface_table,
};
pub use update::{
    InstallManifest, InstallResourceConfig, InstallerEngine, StandardInstallerEngine, UpdateEntry,
    UpdatePackage, parse_install_manifest, parse_update_definition, validate_archive_entry_path,
};
pub use vfs_core::{
    MockVfs, OverlayVfs, VfsResolver, VirtualFileSystem, is_safe_vfs_path,
    is_windows_reserved_name, normalize_charset_name, normalize_newlines, normalize_vfs_path,
    resolve_vfs_path, sanitize_vfs_path, wildcard_match,
};
pub use vfs_integration::{
    DecodeResult, denormalize_newlines, detect_and_decode, detect_and_decode_ext, detect_mime_type,
    encode_to_charset, open_shift_jis_file, open_text_file,
};

#[cfg(test)]
mod tests;
