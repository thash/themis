# Themis - File Renaming Utility

A simple utility for renaming files with prefixes and suffixes.

## For Windows Users

To install and run this application on Windows, follow these steps:

### Option 1: Building from Source (Recommended)

1. **Install Prerequisites**:
   - Install [Git](https://git-scm.com/download/win)
   - Install [Node.js](https://nodejs.org/) (LTS version recommended)
   - Install [Rust](https://www.rust-lang.org/tools/install)
   - Install Visual Studio Build Tools:
     - Download from [Visual Studio Downloads](https://visualstudio.microsoft.com/downloads/)
     - Select "Build Tools for Visual Studio" (not Visual Studio Code)
     - During installation, ensure "Desktop development with C++" is selected

2. **Clone and Build the Application**:
   ```bash
   # Clone the repository
   git clone https://github.com/yourusername/themis.git
   cd themis

   # Install dependencies
   npm install

   # Build the application
   npm run tauri build
   ```

3. **Find the Installer**:
   - After building, the Windows installer will be located at:
     - MSI installer: `src-tauri/target/release/bundle/msi/themis_0.1.0_x64.msi`
     - Setup executable: `src-tauri/target/release/bundle/nsis/themis_0.1.0_x64-setup.exe`

4. **Run the Installer**:
   - Double-click the MSI file or setup executable
   - Follow the installation prompts
   - The application will be installed and a shortcut will be created

### Option 2: Using a Pre-built Installer

If you received a pre-built installer file (either `.msi` or `-setup.exe`):

1. **Run the Installer**:
   - Double-click the installer file
   - Follow the installation prompts
   - The application will be installed and a shortcut will be created

2. **Launch the Application**:
   - Use the desktop shortcut or find the application in the Start menu

## Features

- Add prefixes and suffixes to multiple files at once
- Preview the new filenames before renaming
- Simple and intuitive user interface

## Troubleshooting

- **WebView2 Runtime**: The application requires Microsoft's WebView2 runtime. The installer will automatically download and install it if needed.
- **Windows 7 Support**: The application should work on Windows 7 and above.
- **Installation Issues**: If you encounter any issues during installation, ensure you have administrator privileges.
