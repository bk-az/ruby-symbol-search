# Ruby Symbol Search

A Visual Studio Code extension designed to boost productivity with lightning-fast, real-time search and navigation of Ruby symbols across your workspace.

---

![demo](https://github.com/user-attachments/assets/f1867183-1029-4866-9df9-d7a4fb29c0cb)

## Features

### 1. Lightning-Fast Symbol Indexing
- **Instant Indexing**: Rapidly scans and indexes all Ruby symbols (classes, modules, methods, etc.) in your workspace in seconds.  
- **Real-Time Sync**: Updates the index immediately as Ruby files are added, edited, or removed, ensuring no delays.  
- **Live Progress Feedback**: Displays quick status updates in the status bar so you’re always informed.

### 2. Smart Search and Seamless Navigation
- **Intelligent Fuzzy Matching**: Type a symbol name or a partial match, and results are ranked instantly based on relevance, saving time and effort.  
- **Context-Aware File Filtering**:  
  - Refine your search to specific files by appending `@ file_name` to your query.  
  - Examples: `send_notification @ models/document.rb`, `send_notification @ models document`, or even `send_notification @ document`—all work seamlessly.  
- **Quick Symbol Listing**:  
  - Effortlessly find all symbols in a specific file (whether it’s open or not) using the `@ file_name` syntax anywhere in editor through global search input.  
  - Example: `@ app/controllers/application_controller.rb` or `@ application controller` delivers precise results in moments.

### 3. Go to Symbol in File (Current File)
1. In currently opened Ruby file, press <kbd>Cmd</kbd>+<kbd>Shift</kbd>+<kbd>O</kbd> (Mac) or <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>O</kbd> (Windows/Linux).  
2. Choose a symbol to navigate within the current file.  
3. To disable this feature, set `rubySymbolSearch.enableDocumentSymbols` to `false` in **Settings**.

## Key Mappings
- **Default Shortcuts**:  
  - **Mac**: <kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>R</kbd>  
  - **Windows/Linux**: <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>R</kbd>  
- **Customization**:  
  - Go to **Keyboard Shortcuts** (`Cmd+K Cmd+S` on Mac) and find `rubySymbolSearch.search` to change the key binding.

## Commands
You can access two primary commands from the Command Palette (<kbd>Cmd</kbd>+<kbd>Shift</kbd>+<kbd>P</kbd> or <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>P</kbd>):

| Command                 | Description                                              |
|-------------------------|----------------------------------------------------------|
| **Ruby Symbol Search: Index Files**    | Manually re-index all Ruby files in the workspace.      |
| **Ruby Symbol Search: Search Symbols** | Opens the global search for Ruby symbols.               |

---

## Installation

1. Install **Ruby Symbol Search** from the Visual Studio Code Marketplace.  
2. Open a Ruby project in VS Code.  
3. Indexing begins automatically if `autoIndex` is enabled (see [Configuration](#configuration)).

---

## Configuration

Customize the extension’s behavior through **Settings** or by editing your JSON settings directly:

- **`rubySymbolSearch.enableDocumentSymbols`** (default: `true`)  
  Enable or disable the document symbol provider for Ruby files (used by Go to Symbol in File).
  
- **`rubySymbolSearch.autoIndex`** (default: `true`)  
  Automatically indexes Ruby symbols on opening a workspace.
  
- **`rubySymbolSearch.excludedFolders`** (default: `["node_modules", "log"]`)  
  Excludes specified folders from indexing.

---

## Usage Summary

### 1. Global Search
1. Press the **Search Ruby Symbols** key binding (<kbd>Cmd</kbd>+<kbd>Shift</kbd>+<kbd>R</kbd> / <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>R</kbd>) or run **Ruby Symbol Search: Search Symbols** from the Command Palette.  
2. Type the name of the symbol (supports partial/fuzzy matches).  
3. (Optional) Use `@ file_name` to filter results by file.  
4. Select a result to jump directly to that symbol.

### 2. Go to Symbol in File (Current File)
1. In currently opened Ruby file, press <kbd>Cmd</kbd>+<kbd>Shift</kbd>+<kbd>O</kbd> (Mac) or <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>O</kbd> (Windows/Linux).  
2. Choose a symbol to navigate within the current file.  
3. To disable this feature, set `rubySymbolSearch.enableDocumentSymbols` to `false` in **Settings**.

---

## Contributing

Contributions are welcome! If you find issues or have feature requests, please file an issue or pull request in the [GitHub repository](https://github.com/bk-az/ruby-symbol-search).

---

## License

This project is licensed under the [MIT License](LICENSE).
