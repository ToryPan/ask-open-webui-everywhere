
# AOE: Ask Open WebUI Everywhere

**AOE** is a browser extension designed to integrate [Open WebUI](https://github.com/open-webui/open-webui) directly into your browsing experience.

Open WebUI is a powerful, beautifully designed AI tool that allows for extensive model customization. For many of us, it has become an indispensable part of our daily workflow. However, constantly switching tabs to copy and paste content from web pages into an AI chat can be tedious and disruptive. Furthermore, pasting raw text often lacks the necessary context for the AI to provide accurate answers.

**AOE** solves this by opening your Open WebUI instance in the browser's side panel, allowing you to interact with AI alongside any web page. With the new Insert Text and Insert Screen features, providing context to your AI has never been faster. The goal is simple: **Ask Open WebUI, Everywhere.**

![alt text](img/image.png)

## Features

- **Side Panel Integration:** Access your Open WebUI instance without leaving your current tab.
- **Insert Text (Context-Aware):** One click to parse the current webpage's main content and attach it to the chat as a .txt file.
- **Insert Screen (Visual Context):** One click to capture a screenshot of the current visible tab and paste it directly into the chat input.

## Browser Requirements
Due to inconsistencies in Side Panel API support across older browser versions, it is highly recommended to upgrade to the latest version of your browser. 

AOE has been tested and verified on the following versions:

Microsoft Edge: 143.0.3650.96 (or higher)
Google Chrome: 143.0.7499.169 (or higher)

## Installation (Chrome Example)

1.  **Download the Source Code:**
    Clone or download the `AOE` folder from this repository to your local machine.

2.  **Load the Extension:**
    - Open Chrome and navigate to `chrome://extensions/`.
    - Toggle **Developer mode** in the top right corner.
    - Click **Load unpacked** and select the `AOE` folder you just downloaded.

## Configuration

1.  **Access Settings:**
    Right-click the AOE extension icon in your browser toolbar and select **Options**.

2.  **Configure URLs:**
    - **UI URL:** Enter the address of your Open WebUI instance. You can include a specific model to ensure it loads by default every time.
      - *Example:* `http://myOpen WebUI.xxx.com/`
      - *Example with Model:* `http://myOpen WebUI.xxx.com/?model=gemini-3-pro`
    
    - **Target Match URL:** Enter the pattern for permissions (usually your domain with a **wildcard**).
      - *Example:* `http://myOpen WebUI.xxx.com/*`

3.  **Open WebUI Settings:**
    - In your Open WebUI instance, go to **Settings > Interface**.
    - Enable the option **"Paste Large Text as File"**.
    - Click **Save**.

## Usage

1.  Navigate to any web page you want to analyze.
2.  Click the AOE icon to open the browser side panel.
3.  Once the panel loads:
    -   Click "Insert Text": The extension extracts the page text and attaches it to the chat as a file.
    -   Click "Insert Screen": The extension captures the visible area of the left-hand tab and pastes the image into the chat.

## How it Works
### 1. Insert Text
Open WebUI has a feature where pasted text exceeding 1,000 characters is automatically converted into a file upload. This extension leverages that mechanism cleverly:

- When you click "Insert Text", the extension's page parser extracts the relevant text from the current webpage.
- It simulates a paste action with a "dummy" string longer than 1,000 characters to trigger the Open WebUI file upload function.
- The extension then intercepts this process and swaps the dummy text with the *actual* webpage text (even if the real text is shorter than 1,000 characters).
- This ensures the content is always uploaded cleanly as a file attachment, preserving context.
### 2. Insert Screen (Image Injection)
- The extension uses `chrome.tabs.captureVisibleTab` to grab the pixels of the active tab.
- This image is converted into a `File` object and injected into a `DataTransfer` container.
- A standard `paste` event is dispatched to the `#chat-input`, mimicking a real user pasting an image from their clipboard.

## Development & Contributing

### Future Improvements
- **Text Extraction:** Currently, the extension filters out specific tags (e.g., `SCRIPT`, `STYLE`, `NAV`, `AD`) to clean up the content. I previously experimented with `Readability.js`, but it resulted in some data loss. The current visibility-check method works but has room for improvement.
- **API Integration:** I attempted to use Open WebUI's file upload API, but had difficulty getting the file to appear directly in the current chat context without complex chaining. If you have experience with this, contributions are welcome!

### Excluded Tags
The current parser ignores the following HTML tags to reduce noise:
`['SCRIPT', 'STYLE', 'NOSCRIPT', 'IFRAME', 'CANVAS', 'SVG', 'HEADER', 'FOOTER', 'NAV', 'TEXTAREA', 'SELECT', 'APPLET', 'MAP']`

I welcome all feedback, discussions, and pull requests to make AOE better!

## License

[MIT](LICENSE)