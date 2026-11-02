pub struct BundledResourceTarget {
    pub source_prefix: String,
    pub destination_dir: std::path::PathBuf,
    pub refresh: bool,
    pub refresh_undelete_mask: Vec<String>,
}

#[allow(dead_code)]
pub struct InstallInspectionResult {
    pub ghost_name: String,
    pub root_prefix: String,
    pub kind: String,
    pub target_base_path: String,
    pub safe_dir_name: String,
    pub alt_safe_name: String,
    pub bundled_resources: Vec<BundledResourceTarget>,
    pub accept: Option<String>,
    pub bootghost: Option<String>,
    pub refresh: bool,
    pub refresh_undelete_mask: Vec<String>,
}
