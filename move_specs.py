import os
import shutil
import glob

# Mapping of file name to its new destination folder
nas_mapping = {
    "standard-ghost-spec.md": "docs/doc-nas-spec/ghost/standard-ghost-spec.md",
    "surfaces-and-collision-spec.md": "docs/doc-nas-spec/ghost/surfaces-and-collision-spec.md",
    "ghost-import-and-asset-separation-spec.md": "docs/doc-nas-spec/ghost/ghost-import-and-asset-separation-spec.md",
    "ghost-compatibility-gap-and-roadmap.md": "docs/doc-nas-spec/ghost/ghost-compatibility-gap-and-roadmap.md",
    "surface-and-subchar-spec.md": "docs/doc-nas-spec/ghost/surface-and-subchar-spec.md",

    "shiori-integration.md": "docs/doc-nas-spec/shiori-script/shiori-integration.md",
    "sakura-script-and-balloon-spec.md": "docs/doc-nas-spec/shiori-script/sakura-script-and-balloon-spec.md",
    "plugin-and-shiori-fallback-spec.md": "docs/doc-nas-spec/shiori-script/plugin-and-shiori-fallback-spec.md",

    "encoding-and-vfs-spec.md": "docs/doc-nas-spec/platform/encoding-and-vfs-spec.md",
    "wasm-and-plugin-extensibility.md": "docs/doc-nas-spec/platform/wasm-and-plugin-extensibility.md",
    "android-overlay-and-service-spec.md": "docs/doc-nas-spec/platform/android-overlay-and-service-spec.md",

    "context-menu-spec.md": "docs/doc-nas-spec/ui/context-menu-spec.md",
    "submenu-window-spec.md": "docs/doc-nas-spec/ui/submenu-window-spec.md",
    "shell-menu-pictures-spec.md": "docs/doc-nas-spec/ui/shell-menu-pictures-spec.md",
    "composition-plan-integration-spec.md": "docs/doc-nas-spec/ui/composition-plan-integration-spec.md",
    "compatibility-implementation-plan.md": "docs/doc-nas-spec/compatibility-implementation-plan.md"
}

ssp_mapping = {
    "ssp-font-and-ui-spec.md": "docs/doc-ssp-spec/implicit-specs/ssp-font-and-ui-spec.md",
    "ssp-master-compatibility-spec.md": "docs/doc-ssp-spec/implicit-specs/ssp-master-compatibility-spec.md",
    "ssp-compatibility-reference.md": "docs/doc-ssp-spec/implicit-specs/ssp-compatibility-reference.md",
    "explorer.md": "docs/doc-ssp-spec/external-specs/explorer.md",
    "menu-bitmap.md": "docs/doc-ssp-spec/external-specs/menu-bitmap.md",
    "window-snap.md": "docs/doc-ssp-spec/external-specs/window-snap.md",
    "local-reference-and-test-spec.md": "docs/doc-ssp-spec/external-specs/local-reference-and-test-spec.md"
}

source_dirs = [
    "docs/doc/nas-spec",
    "docs/doc/ssp-spec",
    "docs/doc/ghost",
    "docs/doc/shiori-script",
    "docs/doc/platform",
    "docs/doc/reference"
]

all_mapping = {**nas_mapping, **ssp_mapping}

moved = set()

# Process each source directory
for src_dir in source_dirs:
    if not os.path.exists(src_dir):
        continue
    for f in os.listdir(src_dir):
        if not f.endswith(".md"):
            continue
        if "copy" in f.lower():
            # Delete copies
            os.remove(os.path.join(src_dir, f))
            print(f"Deleted {os.path.join(src_dir, f)}")
            continue

        if f in all_mapping:
            src_path = os.path.join(src_dir, f)
            dest_path = all_mapping[f]
            if f not in moved:
                shutil.copy2(src_path, dest_path)
                moved.add(f)
                print(f"Moved {src_path} to {dest_path}")

            # Now we can safely remove the source file
            os.remove(src_path)
            print(f"Deleted source {src_path}")
        else:
            print(f"Unmapped file: {os.path.join(src_dir, f)}")

# Delete spec matrix from reference since it belongs to docs/spec/
if os.path.exists("docs/doc/reference/specification-compliance-matrix.md"):
    os.remove("docs/doc/reference/specification-compliance-matrix.md")
    print("Deleted specification-compliance-matrix.md")

# Clean up empty dirs if any
for src_dir in source_dirs:
    if os.path.exists(src_dir) and not os.listdir(src_dir):
        os.rmdir(src_dir)
        print(f"Removed empty dir {src_dir}")
