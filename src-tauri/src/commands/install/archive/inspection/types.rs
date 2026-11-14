pub struct BundledResourceTarget {
    source_prefix: String,
    destination_dir: std::path::PathBuf,
    refresh: bool,
    refresh_undelete_mask: Vec<String>,
}

impl BundledResourceTarget {
    pub fn new(
        source_prefix: String,
        destination_dir: std::path::PathBuf,
        refresh: bool,
        refresh_undelete_mask: Vec<String>,
    ) -> Self {
        Self {
            source_prefix,
            destination_dir,
            refresh,
            refresh_undelete_mask,
        }
    }

    // Add getter methods
    pub fn source_prefix(&self) -> &str {
        &self.source_prefix
    }
    pub fn destination_dir(&self) -> &std::path::Path {
        &self.destination_dir
    }
    pub fn refresh(&self) -> bool {
        self.refresh
    }
    pub fn refresh_undelete_mask(&self) -> &[String] {
        &self.refresh_undelete_mask
    }
}

#[allow(dead_code)]
pub struct InstallInspectionResult {
    ghost_name: String,
    root_prefix: String,
    kind: String,
    target_base_path: String,
    safe_dir_name: String,
    alt_safe_name: String,
    bundled_resources: Vec<BundledResourceTarget>,
    accept: Option<String>,
    bootghost: Option<String>,
    refresh: bool,
    refresh_undelete_mask: Vec<String>,
}

#[allow(dead_code)]
impl InstallInspectionResult {
    #[allow(clippy::too_many_arguments)]
    pub fn new(
        ghost_name: String,
        root_prefix: String,
        kind: String,
        target_base_path: String,
        safe_dir_name: String,
        alt_safe_name: String,
        bundled_resources: Vec<BundledResourceTarget>,
        accept: Option<String>,
        bootghost: Option<String>,
        refresh: bool,
        refresh_undelete_mask: Vec<String>,
    ) -> Self {
        Self {
            ghost_name,
            root_prefix,
            kind,
            target_base_path,
            safe_dir_name,
            alt_safe_name,
            bundled_resources,
            accept,
            bootghost,
            refresh,
            refresh_undelete_mask,
        }
    }

    // Add getter methods
    pub fn ghost_name(&self) -> &str {
        &self.ghost_name
    }
    pub fn root_prefix(&self) -> &str {
        &self.root_prefix
    }
    pub fn kind(&self) -> &str {
        &self.kind
    }
    pub fn target_base_path(&self) -> &str {
        &self.target_base_path
    }
    pub fn safe_dir_name(&self) -> &str {
        &self.safe_dir_name
    }
    pub fn alt_safe_name(&self) -> &str {
        &self.alt_safe_name
    }
    pub fn bundled_resources(&self) -> &[BundledResourceTarget] {
        &self.bundled_resources
    }
    pub fn accept(&self) -> Option<&str> {
        self.accept.as_deref()
    }
    pub fn bootghost(&self) -> Option<&str> {
        self.bootghost.as_deref()
    }
    pub fn refresh(&self) -> bool {
        self.refresh
    }
    pub fn refresh_undelete_mask(&self) -> &[String] {
        &self.refresh_undelete_mask
    }
}
