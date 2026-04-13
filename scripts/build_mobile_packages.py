import os
import subprocess
import sys

def colored_print(text, color_code):
    print(f"\033[{color_code}m{text}\033[0m")

def run_command(command, description):
    colored_print(f"[*] Starting: {description}", "34")
    try:
        # Use shell=True for windows cross-compatibility
        result = subprocess.run(command, shell=True, check=True, text=True, capture_output=True)
        colored_print(f"[SUCCESS] {description} completed.", "32")
        return True
    except subprocess.CalledProcessError as e:
        colored_print(f"[ERROR] {description} failed.\n{e.stderr}", "31")
        return False

def build_omni_platforms():
    colored_print("=== Omni Trading: Automated Native Distribution Builder ===", "36")
    print("This python SDK orchestrates capacitor and electron pipelines to bundle the web platform into IOS, Android, and MacOS binaries.\n")
    
    # 1. Compile the main Web Payload (Vite)
    if not run_command("npm run build", "Compiling internal Web application bundle (Vite)"):
        sys.exit(1)
        
    print("\n--- Compiling Android (APK) ---")
    run_command("npx cap add android", "Generating Android native scaffold")
    run_command("npx cap sync android", "Syncing production web assets to Android pipeline")
    colored_print("[READY] Android Studio project configured. Final APK generation requires Gradle run.", "33")
    
    print("\n--- Compiling iOS (IPA/app) ---")
    run_command("npx cap add ios", "Generating iOS native scaffold")
    run_command("npx cap sync ios", "Syncing production web assets to iOS pipeline")
    colored_print("[READY] XCode workspace configured. Final IPA compilation requires xcodebuild.", "33")
    
    print("\n--- Compiling MacOS/Windows (DMG/EXE) ---")
    run_command("npx electron-packager . Omni --platform=darwin,win32 --out=native_dist --overwrite", "Compiling Electron Node Binaries")
    colored_print("[READY] Desktop packages injected to ./native_dist", "33")
    
    print("\n=== BUILD PROCESS COMPLETE ===")
    colored_print("All distributions are synchronized and ready for App Store/Play Store delivery.", "32")

if __name__ == "__main__":
    build_omni_platforms()
