pub struct BundledResourceTarget {
    pub source_prefix: String,
    pub destination_dir: std::path::PathBuf,
    pub refresh: bool,
    pub refresh_undelete_mask: Vec<String>,
}

#[allow(dead_code)]
impl BundledResourceTarget {
    pub fn source_prefix(&self) -> &str { &self.source_prefix }
    pub fn destination_dir(&self) -> &std::path::Path { &self.destination_dir }
    pub fn refresh(&self) -> bool { self.refresh }
    pub fn refresh_undelete_mask(&self) -> &[String] { &self.refresh_undelete_mask }
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

#[allow(dead_code)]
impl InstallInspectionResult {
    pub fn ghost_name(&self) -> &str { &self.ghost_name }
    pub fn root_prefix(&self) -> &str { &self.root_prefix }
    pub fn kind(&self) -> &str { &self.kind }
    pub fn target_base_path(&self) -> &str { &self.target_base_path }
    pub fn safe_dir_name(&self) -> &str { &self.safe_dir_name }
    pub fn alt_safe_name(&self) -> &str { &self.alt_safe_name }
    pub fn bundled_resources(&self) -> &[BundledResourceTarget] { &self.bundled_resources }
    pub fn accept(&self) -> Option<&str> { self.accept.as_deref() }
    pub fn bootghost(&self) -> Option<&str> { self.bootghost.as_deref() }
    pub fn refresh(&self) -> bool { self.refresh }
    pub fn refresh_undelete_mask(&self) -> &[String] { &self.refresh_undelete_mask }
}
