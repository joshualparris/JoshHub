Trusted Web Activity (TWA) — Quick Start
======================================

This README shows the fastest path to wrap this PWA into an Android app (Trusted Web Activity) using Bubblewrap.

Prerequisites
- Node.js (LTS)
- Java JDK 11+
- Android SDK + Android Studio (for building and testing the generated project)
- A live HTTPS site for the PWA (you have: `https://joshualparris.github.io/JoshNFCAudio/`)

1) Install Bubblewrap (global)

```powershell
npm install -g @bubblewrap/cli
```

2) Initialize the TWA project

Run from your repo folder (or any folder where you want the Android project generated):

```powershell
# create a folder for the twa project
mkdir twa-build; cd twa-build
# use your live manifest (the Bubblewrap CLI will prompt for some details)
bubblewrap init --manifest=https://joshualparris.github.io/JoshNFCAudio/manifest.json
```

Follow the interactive prompts. Recommended values:
- `Application id` / package name: `com.joshualparris.joshnfcaudio` (or change to your domain style)
- `Application name`: `NFC Audio Player` (or as you prefer)

3) Build the Android Studio project

```powershell
bubblewrap build
```

This produces an `android` folder containing an Android Studio project. Open it in Android Studio and run on a device.

4) Digital Asset Links (make the TWA "trusted")

To allow the app and the site to be trusted and open links seamlessly, you must host an `assetlinks.json` file on your domain under `/.well-known/assetlinks.json`.
Bubblewrap will display the exact JSON you need. The JSON includes your Android app package name and the app signing key's SHA256 fingerprint.

Example workflow to get the fingerprint (if you generate a signing key locally):

```powershell
# generate a keystore (if you don't already have one)
keytool -genkeypair -v -keystore release.keystore -alias release -keyalg RSA -keysize 2048 -validity 10000
# get SHA256 fingerprint
keytool -list -v -keystore release.keystore -alias release
```

Bubblewrap can also generate the `assetlinks.json` text and tell you what to publish. Use the example template `twa/assetlinks.example.json` in this repo as a starting point (replace the package name and fingerprint values with those produced by Bubblewrap or keytool).

5) Test Web NFC inside the TWA

- Install the generated app on your Android device from Android Studio (Run).
- Open the app and test the NFC flows: Start NFC Scan, Write to Card.
- If Web NFC behaves differently from Chrome tab, note the behavior. If TWA's Web NFC is unreliable, the next step is to wrap using Capacitor and add a native NFC plugin.

6) Create a release for Google Play

- Build a release AAB in Android Studio (Generate Signed Bundle / APK)
- Upload AAB to Google Play Console (requires a developer account)
- Optionally enable Play App Signing and follow the Play Console prompts

Notes & troubleshooting
- If NFC APIs are missing inside the installed TWA, try updating the Android System WebView / Chrome on the device. TWA uses Chrome's engine.
- If you need guaranteed native NFC access (UID, background read) convert to Capacitor and use a native plugin.

Files added in this repo
- `twa/assetlinks.example.json` — template you can edit and publish to `/.well-known/assetlinks.json` on your site once you have the app signing fingerprint.

If you want I can also:
- Run `bubblewrap init` locally and commit the generated Android project to the repo (large commit). Say "commit TWA" if you want the generated Android project added here.
- Or scaffold a Capacitor wrapper and a small native plugin integration instead.

---
If you'd like me to run `bubblewrap init` in this workspace and produce the Android project here, tell me and I'll proceed and commit the generated files.
