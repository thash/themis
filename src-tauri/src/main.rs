// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::fs;
use std::path::Path;
use serde::Serialize;

#[derive(Serialize)]
struct RenameResult {
    success: bool,
    renamed: usize,
    errors: Vec<String>,
}

#[tauri::command]
fn rename_files_with_prefix_suffix(file_paths: Vec<String>, prefix: String, suffix: String) -> RenameResult {
    let mut result = RenameResult {
        success: true,
        renamed: 0,
        errors: Vec::new(),
    };

    for file_path in file_paths {
        let path = Path::new(&file_path);

        // Get the file name and parent directory
        if let (Some(parent), Some(file_name)) = (path.parent(), path.file_name()) {
            let file_name_str = file_name.to_string_lossy();

            // Create the new file name with prefix and suffix
            let new_file_name = if let Some(extension_pos) = file_name_str.rfind('.') {
                // If the file has an extension, add the suffix before the extension
                let (name, extension) = file_name_str.split_at(extension_pos);
                format!("{}{}{}{}", prefix, name, suffix, extension)
            } else {
                // No extension, just add prefix and suffix
                format!("{}{}{}", prefix, file_name_str, suffix)
            };

            let new_path = parent.join(new_file_name);

            // Attempt to rename the file
            match fs::rename(path, &new_path) {
                Ok(_) => {
                    result.renamed += 1;
                }
                Err(e) => {
                    result.success = false;
                    result.errors.push(format!("Failed to rename {}: {}", file_path, e));
                }
            }
        } else {
            result.success = false;
            result.errors.push(format!("Invalid path: {}", file_path));
        }
    }

    // If we renamed at least one file but had some errors, still consider it a partial success
    if result.renamed > 0 && !result.errors.is_empty() {
        result.success = true;
    }

    result
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![rename_files_with_prefix_suffix])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
