import { open } from "@tauri-apps/api/dialog";
import { appWindow } from "@tauri-apps/api/window";

let selectFileBtn: HTMLButtonElement | null;
let selectedFileDisplay: HTMLElement | null;
let debugOutput: HTMLElement | null;

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

async function selectFile() {
  try {
    logDebug("Opening file dialog...");

    // Open a file dialog and allow the user to select a file
    // Removing filters to allow selection of any file
    const selected = await open({
      multiple: false,
      directory: false
    });

    logDebug(`Dialog result: ${JSON.stringify(selected)}`);

    // Handle the case when user cancels the dialog
    if (selected === null) {
      logDebug("User cancelled the dialog");
      return;
    }

    // Display the selected file path
    if (selectedFileDisplay && selected) {
      const filePath = Array.isArray(selected) ? selected[0] : selected;
      selectedFileDisplay.textContent = filePath;
      logDebug(`Selected file: ${filePath}`);
    }
  } catch (error) {
    const errorMessage = `Error selecting file: ${(error as Error).message}`;
    console.error(errorMessage);
    logDebug(errorMessage);

    if (selectedFileDisplay) {
      selectedFileDisplay.textContent = errorMessage;
    }
  }
}

window.addEventListener("DOMContentLoaded", () => {
  logDebug("DOM loaded, initializing app...");

  selectFileBtn = document.querySelector("#select-file-btn");
  selectedFileDisplay = document.querySelector("#selected-file-display");
  debugOutput = document.querySelector("#debug-output");

  if (selectFileBtn) {
    logDebug("Select file button found, adding event listener");
    selectFileBtn.addEventListener("click", () => {
      logDebug("Button clicked, opening file dialog");
      selectFile();
    });
  } else {
    logDebug("ERROR: Select file button not found!");
  }

  if (selectedFileDisplay) {
    logDebug("Selected file display element found");
  } else {
    logDebug("ERROR: Selected file display element not found!");
  }

  if (debugOutput) {
    logDebug("Debug output element found");
  } else {
    console.error("Debug output element not found!");
  }

  // Add initialization message
  logDebug(`App initialized successfully`);
});
