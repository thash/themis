import { open } from "@tauri-apps/api/dialog";
import { invoke } from "@tauri-apps/api/tauri";
import { getVersion } from "@tauri-apps/api/app";

// UI Elements
let prefixInput: HTMLInputElement | null;
let suffixInput: HTMLInputElement | null;
let findTextInput: HTMLInputElement | null;
let replaceTextInput: HTMLInputElement | null;
let prefixSuffixTab: HTMLButtonElement | null;
let replaceTab: HTMLButtonElement | null;
let prefixSuffixContainer: HTMLElement | null;
let replaceContainer: HTMLElement | null;
let renameError: HTMLElement | null;
let selectFileBtn: HTMLButtonElement | null;
let selectFolderBtn: HTMLButtonElement | null;
let renameFilesBtn: HTMLButtonElement | null;
let selectedFilesList: HTMLElement | null;
let renameResult: HTMLElement | null;
let debugOutput: HTMLElement | null;
let appVersion: HTMLElement | null;

// Store selected files
let selectedFiles: string[] = [];

// Track current mode
type RenameMode = "prefix-suffix" | "replace";
let currentMode: RenameMode = "prefix-suffix";

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

// Function to get the text to find
function getFindText(): string {
  return findTextInput?.value || "";
}

// Function to get the replacement text
function getReplaceText(): string {
  return replaceTextInput?.value || "";
}

// Function to switch between modes
function switchMode(mode: RenameMode) {
  currentMode = mode;
  const tabSwitch = document.querySelector('.tab-switch');

  // Update UI to reflect the current mode
  if (prefixSuffixTab && replaceTab && prefixSuffixContainer && replaceContainer && tabSwitch) {
    if (mode === "prefix-suffix") {
      tabSwitch.classList.remove('right');
      tabSwitch.classList.add('left');
      prefixSuffixTab.classList.add("active");
      replaceTab.classList.remove("active");
      prefixSuffixContainer.classList.add("active");
      replaceContainer.classList.remove("active");
    } else {
      tabSwitch.classList.remove('left');
      tabSwitch.classList.add('right');
      prefixSuffixTab.classList.remove("active");
      replaceTab.classList.add("active");
      prefixSuffixContainer.classList.remove("active");
      replaceContainer.classList.add("active");
    }
  }

  // Clear any error messages
  if (renameError) {
    renameError.textContent = "";
  }

  // Clear selected files when switching modes
  selectedFiles = [];
  updateSelectedFilesUI();

  logDebug(`Switched to ${mode} mode`);
}

// Function to generate the new filename with prefix and suffix
function generateNewFileNameWithPrefixSuffix(fileName: string): string {
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

// Function to generate the new filename with text replacement
function generateNewFileNameWithReplace(fileName: string): string {
  const findText = getFindText();
  const replaceText = getReplaceText();

  // Replace all occurrences of the find text with the replace text
  return fileName.split(findText).join(replaceText);
}

// Function to generate the new filename based on the current mode
function generateNewFileName(fileName: string): string {
  if (currentMode === "prefix-suffix") {
    return generateNewFileNameWithPrefixSuffix(fileName);
  } else {
    return generateNewFileNameWithReplace(fileName);
  }
}

// Function to update the UI based on selected files
function updateSelectedFilesUI() {
  if (!selectedFilesList || !renameFilesBtn) return;

  if (selectedFiles.length === 0) {
    selectedFilesList!.innerHTML = "No files/folders selected";
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
  let isValid = false;

  if (currentMode === "prefix-suffix") {
    const prefix = getPrefix();
    const suffix = getSuffix();
    isValid = prefix.trim() !== '' || suffix.trim() !== '';

    if (!isValid && renameError) {
      renameError.textContent = 'Please enter at least a prefix or a suffix';
    }
  } else { // replace mode
    const findText = getFindText();
    const replaceText = getReplaceText();
    isValid = findText.trim() !== '';

    if (!isValid && renameError) {
      renameError.textContent = 'Please enter text to find';
    }
  }

  if (renameError && isValid) {
    // Clear any existing error message if inputs are valid
    renameError.textContent = '';
  }

  // If files are already selected, update the UI to reflect the changes
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
  // Check if inputs are valid
  if (!validateInputs()) {
    // validateInputs already shows the appropriate error message
    return;
  }

  try {
    logDebug("Opening file selection dialog...");

    // Open a dialog for selecting files
    const selected = await open({
      multiple: true,
      directory: false // false for files
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
    const errorMessage = `Error selecting files: ${(error as Error).message}`;
    console.error(errorMessage);
    logDebug(errorMessage);

    if (selectedFilesList) {
      selectedFilesList.innerHTML = errorMessage;
    }
  }
}

async function selectFolders() {
  // Check if inputs are valid
  if (!validateInputs()) {
    // validateInputs already shows the appropriate error message
    return;
  }

  try {
    logDebug("Opening folder selection dialog...");

    // Open a dialog for selecting folders
    const selected = await open({
      multiple: true,
      directory: true // true for folders
    });

    logDebug(`Dialog result: ${JSON.stringify(selected)}`);

    // Handle the case when user cancels the dialog
    if (selected === null) {
      logDebug("User cancelled the dialog");
      return;
    }

    // Store and display the selected folder paths
    selectedFiles = Array.isArray(selected) ? selected : [selected];

    // Update UI based on selected folders
    updateSelectedFilesUI();

    logDebug(`Selected ${selectedFiles.length} folders`);
  } catch (error) {
    const errorMessage = `Error selecting folders: ${(error as Error).message}`;
    console.error(errorMessage);
    logDebug(errorMessage);

    if (selectedFilesList) {
      selectedFilesList.innerHTML = errorMessage;
    }
  }
}

async function renameFiles() {
  if (selectedFiles.length === 0) {
    logDebug("No files/folders selected for renaming");
    return;
  }

  try {
    logDebug(`Attempting to rename ${selectedFiles.length} files/folders...`);

    let result: { success: boolean; renamed: number; errors: string[] };

    if (currentMode === "prefix-suffix") {
      // Call the Rust command to rename files with prefix and suffix
      result = await invoke("rename_files_with_prefix_suffix", {
        filePaths: selectedFiles,
        prefix: getPrefix(),
        suffix: getSuffix()
      });
    } else {
      // Call the Rust command to rename files with text replacement
      result = await invoke("rename_files_with_text_replacement", {
        filePaths: selectedFiles,
        findText: getFindText(),
        replaceText: getReplaceText()
      });
    }

    if (renameResult) {
      if (result.success) {
        renameResult.className = "success";
        renameResult.textContent = `Successfully renamed ${result.renamed} files/folders.`;
      } else {
        renameResult.className = "error";
        renameResult.textContent = `Error: ${result.errors.join(", ")}`;
      }
    }

    logDebug(`Rename operation completed: ${JSON.stringify(result)}`);

    // Clear the selected files after renaming
    selectedFiles = [];

    // Clear input fields
    if (currentMode === "prefix-suffix") {
      if (prefixInput) prefixInput.value = "";
      if (suffixInput) suffixInput.value = "";
    } else {
      if (findTextInput) findTextInput.value = "";
      if (replaceTextInput) replaceTextInput.value = "";
    }

    updateSelectedFilesUI();

  } catch (error) {
    const errorMessage = `Error renaming files/folders: ${(error as Error).message}`;
    console.error(errorMessage);
    logDebug(errorMessage);

    if (renameResult) {
      renameResult.className = "error";
      renameResult.textContent = errorMessage;
    }
  }
}

window.addEventListener("DOMContentLoaded", async () => {
  logDebug("DOM loaded, initializing app...");

  // Initialize UI elements
  prefixInput = document.querySelector("#prefix-input");
  suffixInput = document.querySelector("#suffix-input");
  findTextInput = document.querySelector("#find-text-input");
  replaceTextInput = document.querySelector("#replace-text-input");
  prefixSuffixTab = document.querySelector("#prefix-suffix-tab");
  replaceTab = document.querySelector("#replace-tab");
  prefixSuffixContainer = document.querySelector("#prefix-suffix-container");
  replaceContainer = document.querySelector("#replace-container");
  renameError = document.querySelector("#rename-error");
  selectFileBtn = document.querySelector("#select-file-btn");
  selectFolderBtn = document.querySelector("#select-folder-btn");
  renameFilesBtn = document.querySelector("#rename-files-btn");
  selectedFilesList = document.querySelector("#selected-files-list");
  renameResult = document.querySelector("#rename-result");
  debugOutput = document.querySelector("#debug-output");
  appVersion = document.querySelector("#app-version");

  // Display app version
  if (appVersion) {
    try {
      const version = await getVersion();
      appVersion.textContent = `v${version}`;
      logDebug(`App version: ${version}`);
    } catch (error) {
      console.error("Failed to get app version:", error);
      logDebug(`Error getting app version: ${(error as Error).message}`);
    }
  } else {
    logDebug("ERROR: App version element not found!");
  }

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

  if (findTextInput) {
    logDebug("Find text input found, adding event listener");
    findTextInput.addEventListener("input", () => {
      validateInputs();
      logDebug(`Find text updated to: ${findTextInput?.value}`);
    });
  } else {
    logDebug("ERROR: Find text input not found!");
  }

  if (replaceTextInput) {
    logDebug("Replace text input found, adding event listener");
    replaceTextInput.addEventListener("input", () => {
      validateInputs();
      logDebug(`Replace text updated to: ${replaceTextInput?.value}`);
    });
  } else {
    logDebug("ERROR: Replace text input not found!");
  }

  if (prefixSuffixTab) {
    logDebug("Prefix/suffix tab found, adding event listener");
    prefixSuffixTab.addEventListener("click", () => {
      switchMode("prefix-suffix");
      logDebug("Switched to prefix/suffix mode");
    });
  } else {
    logDebug("ERROR: Prefix/suffix tab not found!");
  }

  if (replaceTab) {
    logDebug("Replace tab found, adding event listener");
    replaceTab.addEventListener("click", () => {
      switchMode("replace");
      logDebug("Switched to replace mode");
    });
  } else {
    logDebug("ERROR: Replace tab not found!");
  }

  if (selectFileBtn) {
    logDebug("Select files button found, adding event listener");
    selectFileBtn.addEventListener("click", () => {
      logDebug("File button clicked, opening file dialog");
      selectFiles();
    });
  } else {
    logDebug("ERROR: Select files button not found!");
  }

  if (selectFolderBtn) {
    logDebug("Select folders button found, adding event listener");
    selectFolderBtn.addEventListener("click", () => {
      logDebug("Folder button clicked, opening folder dialog");
      selectFolders();
    });
  } else {
    logDebug("ERROR: Select folders button not found!");
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
