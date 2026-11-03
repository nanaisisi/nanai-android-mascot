pub mod animation;
pub mod app;
pub mod descript;
pub mod fmo;
pub mod manifest;
pub mod script;
pub mod shell;
pub mod shiori;
pub mod sstp;
pub mod surfaces;
pub mod surfacetable;
pub mod update;
pub mod vfs;

// 外部公開・後方互換のための再エクスポート
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
    MultiStageShioriLoader, SecurityLevel,
    SenderTypeTag, ShioriEngine, ShioriEngineCandidate, ShioriLifecycleState, ShioriMethod,
    ShioriRequest, ShioriResponse, StatusCode, build_standard_capability_references,
    parse_sender_types,
};
pub use sstp::{IfGhostEntry, SstpMessage, SstpMethod, SstpRequest, SstpResponse, SstpStatusCode};
pub use surfaces::{
    BalloonOffset, CollisionArea, CollisionShape, CompositionLayer, CompositionPlan, DrawMethod,
    ElementDef, HitTestResult, Interval, SerikoAnimation, SortKind, SurfacesTxt,
    parse_surfaces_txt,
};
pub use surfacetable::{
    SurfTableEntry, SurfTableGroup, SurfaceTable, is_parts_name, parse_surface_table,
};
pub use update::{
    InstallManifest, InstallResourceConfig, InstallerEngine, StandardInstallerEngine, UpdateEntry,
    UpdatePackage, parse_install_manifest, parse_update_definition, validate_archive_entry_path,
};
pub use vfs::{
    MockVfs, VfsResolver, detect_and_decode, normalize_vfs_path, open_shift_jis_file,
    open_text_file, resolve_vfs_path,
};

#[cfg(test)]
mod tests;
