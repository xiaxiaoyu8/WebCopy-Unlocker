<p align="center">
  <img src="copy-unlocker-extension/icons/green-128.png" width="96" height="96" alt="Copy Unlocker icon">
</p>

# WebCopy-Unlocker · Unlock Web Page Copying

[中文](README.md) | **English**

[Download Extension ZIP](copy-unlocker-extension.zip) | [Installation](#installation) | [Use Cases](#use-cases)

Copy Unlocker is a lightweight extension for Chrome and Microsoft Edge. When text cannot be selected, copying is blocked, or the context menu is disabled on websites such as Baidu Wenku, CSDN, and Zhihu, click the extension icon to try restoring text selection, copy, cut, paste, and right-click on the current page. It helps you organize study notes, collect excerpts, and copy code.

![Manifest V3](https://img.shields.io/badge/Manifest-V3-4285F4)
![Chrome & Edge](https://img.shields.io/badge/Browser-Chrome%20%26%20Edge-16A34A)
![JavaScript](https://img.shields.io/badge/JavaScript-Vanilla-F7DF1E)

Works in copy-restricted scenarios on Baidu Wenku, CSDN, Zhihu, and similar websites. If this project helps you, please give it a Star. Your support means a lot to me!

## Highlights

- **Manifest V3** extension for Chrome and Microsoft Edge.
- **Click to activate** and unlock the current page on demand.
- **Vanilla JavaScript**, ready to load directly from source.
- **Minimal permissions**, requesting only `activeTab` and `scripting`.

## Use Cases

Try removing restrictions that prevent directly selecting or copying text on **Baidu Wenku, CSDN, Zhihu**, and similar websites. Useful for collecting excerpts, organizing study notes, and copying code snippets from technical articles.

| Scenario | Action |
| --- | --- |
| Baidu Wenku | Try restoring selection and copying for already-loaded content rendered as ordinary web page text |
| CSDN | Try restoring selection, copying, and context menus for article text and code restricted by events or styles |
| Zhihu | Try restoring copying for visible text in answers and articles restricted by frontend events or styles |
| Other websites | Try removing restrictions on text selection, copy shortcuts, or context menus on ordinary web pages |

## Features

- Removes common event-based restrictions on copy, cut, paste, context menus, and text selection.
- Overrides page `user-select` styles to help restore text selection.
- Observes newly inserted content and related event attribute changes to continue removing restrictions.
- Runs periodic cleanup for the first 10 seconds after activation and intercepts subsequent registration of related event listeners.
- A gray icon indicates inactivity. A green icon indicates that the injected script has run, with a notification in the page's top-right corner.
- Resets to gray after refresh or navigation. Click again when needed.

## Installation

### Download from GitHub

1. Click **Code → Download ZIP** in this repository and extract the download.
2. Open `chrome://extensions/` in Chrome or `edge://extensions/` in Edge.
3. Enable **Developer mode** and click **Load unpacked**.
4. Select the `copy-unlocker-extension` folder containing `manifest.json`.
5. Pin Copy Unlocker in the browser's extensions menu for convenient access.

Alternatively, download `copy-unlocker-extension.zip` from this repository, extract it, and select the inner folder with the same name. Keep the installation directory in place, as the browser loads the extension files from it.

## Usage

1. Enable Developer mode on the browser's extensions page, then pin the extension to the toolbar.
2. Open the web page whose content you want to copy.
3. Click the Copy Unlocker icon.
4. Once the icon turns green and the page notification appears, try selecting text, copying, or opening the context menu.

Repeated clicks run cleanup again. A green icon indicates that the script has run. Whether restrictions can be removed depends on the page's implementation.

## Scope and Notes

- Intended for common restrictions implemented through JavaScript events or CSS on ordinary web pages.
- Browser-internal pages, extension management pages, and some protected pages restrict script injection.
- Processing embedded pages depends on browser-granted access. Cross-origin iframes may remain restricted, and iframes loaded after activation may require another click.
- Text in images or Canvas requires other extraction methods such as OCR. Restrictions inside Shadow DOM may also remain.
- Event interception can affect website shortcuts, custom editors, dragging, and context menus. The extension preserves the existing DOM and form values, but complex pages still require practical verification.
- Respect content copyrights and website terms of use.

## Permissions and Privacy

| Permission | Purpose |
| --- | --- |
| `activeTab` | Temporarily grants access to the current tab after a user click |
| `scripting` | Injects the unlock script into pages that the extension is permitted to access |

The current source contains no telemetry, remote requests, account system, or data upload logic. It requests no clipboard read or write permissions. The unlock script handles events and styles in the page's main execution world. Refer to the repository source code for its behavior.

## Project Structure

```text
copy-unlocker-extension/
  manifest.json       Extension configuration and permissions
  background.js       Click activation, injection, and icon state
  unlock-copy.js      Event interception, styles, and dynamic content
  icons/              Gray and green icons
  README.md           Instructions bundled with the extension
README.md             Chinese project homepage
README.en.md          English introduction
copy-unlocker-extension.zip  Unpackable distribution archive
```

## Development and Verification

Load the project directly from source, with no dependency installation or build required. After editing, reload the extension on the extensions management page and refresh the test page.

```sh
node --check copy-unlocker-extension/background.js
node --check copy-unlocker-extension/unlock-copy.js
node --test tests/listener-guard.test.cjs
```

Manually check copy, selection, cut, paste, context menus, repeated clicks, dynamic content, form values, and icon state after refresh and navigation. For protected pages, check injection errors in the extension service worker console.

Repackage with PowerShell

```powershell
Compress-Archive -Path ./copy-unlocker-extension -DestinationPath ./copy-unlocker-extension.zip -Force
```
