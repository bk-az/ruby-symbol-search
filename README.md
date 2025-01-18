# Ruby Symbol Search Extension

## Overview
The **Ruby Symbol Search** is a Visual Studio Code extension designed for efficient navigation and search of Ruby symbols, such as classes, modules, and methods, in your project. This extension dynamically indexes Ruby files in the workspace and provides powerful search capabilities using FlexSearch.

## Features
- **Efficient Symbol Search**: Quickly locate Ruby classes, modules, and methods.
- **Real-Time Indexing**: Dynamically updates the index as files are created, modified, or deleted.
- **Exclusion Rules**: Configure specific folders to exclude from the indexing process.
- **Auto Indexing**: Automatically indexes all Ruby files when the workspace is opened.
- **Quick Navigation**: Jump directly to the symbol's location in the editor.
- **Command Palette Integration**: Easily index or search symbols using commands.

## Commands
The following commands are available via the Command Palette:
1. **Index Ruby Symbols** (`rubySymbolSearch.index`): Manually trigger indexing of all Ruby files in the workspace.
2. **Search Ruby Symbols** (`rubySymbolSearch.search`): Search and navigate to specific symbols.

## Configuration
You can customize the extension through these settings in the `settings.json` file:

1. **`rubySymbolSearch.excludedFolders`**
   - **Type**: `Array<string>`
   - **Default**: `[]`
   - **Description**: List of folders to exclude from indexing.

2. **`rubySymbolSearch.autoIndex`**
   - **Type**: `boolean`
   - **Default**: `true`
   - **Description**: Automatically index all Ruby files on workspace startup.

## How to Use
1. **Install the Extension**:
   - Search for "Ruby Symbol Search" in the VS Code Marketplace and install it.

2. **Start Indexing**:
   - By default, the extension indexes all Ruby files when the workspace opens.
   - Alternatively, trigger the indexing manually using the `Index Ruby Symbols` command.

3. **Search for Symbols**:
   - Use the `Search Ruby Symbols` command from the Command Palette to find and navigate to symbols.

4. **Navigate to Results**:
   - Select a result to open the file and jump directly to the symbol in the editor.

