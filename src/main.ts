import { open } from "@tauri-apps/api/dialog";
import { invoke } from "@tauri-apps/api/tauri";

let prefixInput: HTMLInputElement | null;
let suffixInput: HTMLInputElement | null;
let renameError: HTMLElement | null;
let selectFileBtn: HTMLButtonElement | null;
let renameFilesBtn: HTMLButtonElement | null;
let selectedFilesList: HTMLElement | null;
let renameResult: HTMLElement | null;
let debugOutput: HTMLElement | null;

// Store selected files
let selectedFiles: string[] = [];

// Function to log debug messages
function logDebug(message: string) {
  console.log(message);
  if (debugOutput) {
    const logEntry = document.createElement('div');
    logEntry.textContent = `${new Date().toLocaleTimeString()}: ${message}`;
    debugOutput.appendChild(logEntry);
    debugOutput.scrollTop = debugOutput.scrollHeight;
  }
}

// Function to extract just the filename from a path
function getFileName(filePath: string): string {
  // Split the path by directory separator (works for both Windows and Unix-like)
  const parts = filePath.split(/[\/\\]/);
  // Return the last part (the filename)
  return parts[parts.length - 1];
}

// Function to get the current prefix
function getPrefix(): string {
  return prefixInput?.value || "";
}

// Function to get the current suffix
function getSuffix(): string {
  return suffixInput?.value || "";
}

// Function to generate the new filename with prefix and suffix
function generateNewFileName(fileName: string): string {
  const prefix = getPrefix();
  const suffix = getSuffix();

  // If the file has an extension, add the suffix before the extension
  const lastDotIndex = fileName.lastIndexOf('.');

  if (lastDotIndex !== -1) {
    const nameWithoutExt = fileName.substring(0, lastDotIndex);
    const extension = fileName.substring(lastDotIndex);
    return `${prefix}${nameWithoutExt}${suffix}${extension}`;
  } else {
    // No extension, just add prefix and suffix
    return `${prefix}${fileName}${suffix}`;
  }
}

// Function to update the UI based on selected files
function updateSelectedFilesUI() {
  if (!selectedFilesList || !renameFilesBtn) return;

  if (selectedFiles.length === 0) {
    selectedFilesList!.innerHTML = "No files selected";
    renameFilesBtn.disabled = true;
  } else {
    // Create a list of files
    selectedFilesList!.innerHTML = "";
    selectedFiles.forEach((file) => {
      const fileName = getFileName(file);
      const newFileName = generateNewFileName(fileName);

      const fileItem = document.createElement("div");
      fileItem.style.marginBottom = "1rem";
      fileItem.style.display = "flex";
      fileItem.style.alignItems = "center";

      // Original filename
      const originalNameEl = document.createElement("div");
      originalNameEl.textContent = fileName;
      originalNameEl.style.flexBasis = "45%";

      // Arrow indicating transformation
      const arrowEl = document.createElement("div");
      arrowEl.textContent = "→";
      arrowEl.style.color = "#666";
      arrowEl.style.margin = "0 1rem";
      arrowEl.style.flexBasis = "10%";
      arrowEl.style.textAlign = "center";

      // New filename with prefix and suffix
      const newNameEl = document.createElement("div");
      newNameEl.textContent = newFileName;
      newNameEl.style.color = "#396cd8";
      newNameEl.style.flexBasis = "45%";

      // Add elements to the file item
      fileItem.appendChild(originalNameEl);
      fileItem.appendChild(arrowEl);
      fileItem.appendChild(newNameEl);

      selectedFilesList!.appendChild(fileItem);
    });

    // Enable the rename button
    renameFilesBtn.disabled = false;
  }
}

// Function to check if inputs are valid and update UI accordingly
function validateInputs(): boolean {
  const prefix = getPrefix();
  const suffix = getSuffix();
  const isValid = prefix.trim() !== '' || suffix.trim() !== '';

  if (renameError) {
    // Clear any existing error message
    renameError.textContent = '';
  }

  // If files are already selected, update the UI to reflect the new prefix/suffix
  if (selectedFiles.length > 0) {
    updateSelectedFilesUI();
  }

  return isValid;
}

// Function to show error message
function showError(message: string) {
  if (renameError) {
    renameError.textContent = message;
    logDebug(`Error: ${message}`);
  }
}

async function selectFiles() {
  // Check if at least one of prefix or suffix is provided
  if (!validateInputs()) {
    showError("Please enter at least a prefix or a suffix before selecting files");
    return;
  }

  try {
    logDebug("Opening file dialog...");

    // Open a file dialog and allow the user to select multiple files
    const selected = await open({
      multiple: true,
      directory: false
    });

    logDebug(`Dialog result: ${JSON.stringify(selected)}`);

    // Handle the case when user cancels the dialog
    if (selected === null) {
      logDebug("User cancelled the dialog");
      return;
    }

    // Store and display the selected file paths
    selectedFiles = Array.isArray(selected) ? selected : [selected];

    // Update UI based on selected files
    updateSelectedFilesUI();

    logDebug(`Selected ${selectedFiles.length} files`);
  } catch (error) {
    const errorMessage = `Error selecting file: ${(error as Error).message}`;
    console.error(errorMessage);
    logDebug(errorMessage);

    if (selectedFilesList) {
      selectedFilesList.innerHTML = errorMessage;
    }
  }
}

async function renameFiles() {
  if (selectedFiles.length === 0) {
    logDebug("No files selected for renaming");
    return;
  }

  try {
    logDebug(`Attempting to rename ${selectedFiles.length} files...`);

    // Call the Rust command to rename files
    const result: { success: boolean; renamed: number; errors: string[] } = await invoke("rename_files_with_prefix_suffix", {
      filePaths: selectedFiles,
      prefix: getPrefix(),
      suffix: getSuffix()
    });

    if (renameResult) {
      if (result.success) {
        renameResult.className = "success";
        renameResult.textContent = `Successfully renamed ${result.renamed} files.`;
      } else {
        renameResult.className = "error";
        renameResult.textContent = `Error: ${result.errors.join(", ")}`;
      }
    }

    logDebug(`Rename operation completed: ${JSON.stringify(result)}`);

    // Clear the selected files after renaming
    selectedFiles = [];
    updateSelectedFilesUI();

  } catch (error) {
    const errorMessage = `Error renaming files: ${(error as Error).message}`;
    console.error(errorMessage);
    logDebug(errorMessage);

    if (renameResult) {
      renameResult.className = "error";
      renameResult.textContent = errorMessage;
    }
  }
}

window.addEventListener("DOMContentLoaded", () => {
  logDebug("DOM loaded, initializing app...");

  prefixInput = document.querySelector("#prefix-input");
  suffixInput = document.querySelector("#suffix-input");
  renameError = document.querySelector("#rename-error");
  selectFileBtn = document.querySelector("#select-file-btn");
  renameFilesBtn = document.querySelector("#rename-files-btn");
  selectedFilesList = document.querySelector("#selected-files-list");
  renameResult = document.querySelector("#rename-result");
  debugOutput = document.querySelector("#debug-output");

  if (prefixInput) {
    logDebug("Prefix input found, adding event listener");
    prefixInput.addEventListener("input", () => {
      validateInputs();
      logDebug(`Prefix updated to: ${prefixInput?.value}`);
    });
  } else {
    logDebug("ERROR: Prefix input not found!");
  }

  if (suffixInput) {
    logDebug("Suffix input found, adding event listener");
    suffixInput.addEventListener("input", () => {
      validateInputs();
      logDebug(`Suffix updated to: ${suffixInput?.value}`);
    });
  } else {
    logDebug("ERROR: Suffix input not found!");
  }

  if (selectFileBtn) {
    logDebug("Select files button found, adding event listener");
    selectFileBtn.addEventListener("click", () => {
      logDebug("Button clicked, opening file dialog");
      selectFiles();
    });
  } else {
    logDebug("ERROR: Select files button not found!");
  }

  if (renameFilesBtn) {
    logDebug("Rename files button found, adding event listener");
    renameFilesBtn.addEventListener("click", () => {
      logDebug("Rename button clicked");
      renameFiles();
    });
  } else {
    logDebug("ERROR: Rename files button not found!");
  }

  if (selectedFilesList) {
    logDebug("Selected files list element found");
  } else {
    logDebug("ERROR: Selected files list element not found!");
  }

  if (debugOutput) {
    logDebug("Debug output element found");
  } else {
    console.error("Debug output element not found!");
  }

  // Add initialization message
  logDebug(`App initialized successfully`);
});
