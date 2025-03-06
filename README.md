# Themis - File Renaming Utility

A simple utility for renaming files with prefixes/suffixes, or replacement. Made with [Tauri v1](https://v1.tauri.app/).

<img width="400" alt="Image" src="https://github.com/user-attachments/assets/49e32fa9-29d2-4b7d-abbb-bc9f4d3fb5c9" />
<img width="400" alt="Image" src="https://github.com/user-attachments/assets/11207166-cde7-4f04-b4b4-df4ff7acd70e" />


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
   git clone https://github.com/thash/Themis.git
   cd Themis

   # Install dependencies
   npm install

   # Build the application
   npm run tauri build
   ```

3. **Find the Installer**:
   - After building, the Windows installer (MSI) will be located at: `src-tauri/target/release/bundle/msi/themis_$VERSION_x64.msi`


4. **Run the Installer**:
   - Double-click the MSI file or setup executable
   - Follow the installation prompts
   - The application will be installed and a shortcut will be created

### Option 2: Retrieve a Pre-built Installer

You can find links to Pre-built installers in `Actions` > select the latest succeeded run > `Artifacts` on [GitHub Actions of this repo](https://github.com/thash/Themis/actions).

## For other platforms

It's a personal project created for a Windows user, so I didn't prepare for other platforms. However, [Tauri v1](https://v1.tauri.app/) supports multi-platform development (+ I myself developed Themis on macOS, which [works well locally](https://makeameme.org/meme/it-works-on-5b27d8). Therefore, while I haven't set it up myself, providing builds for other platforms is possible without significant difficulty.

## Development Guide

### Launch Themis locally in development mode

```bash
npm run tauri:dev
```

### Available Scripts

- `npm run tauri:dev` - Run linting and start the development server (use this for daily development)
- `npm run lint` - Run ESLint to check for code issues. Automatically run before launching the development server
- `npm run tauri build` - Build the application for production
- `npm run update-version <version_string>` - Update the application version
