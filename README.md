# Ruby Symbol Search

**Ruby Symbol Search** is a Visual Studio Code extension designed to enhance productivity by providing lightning-fast, real-time search and navigation of Ruby symbols across your workspace. With this extension, you gain access to powerful features like Workspace-wide Ruby Symbol Search, Fuzzy Search, Go to Definition, File-level Symbol Navigation, and an Outline View of the current Ruby file — all without requiring the resource-heavy Ruby LSP.

---

## Features

### Search Ruby Symbols Across Workspace
Quickly search for and navigate to any Ruby symbol across your entire workspace.

**How to Use:**
- Press <kbd>Ctrl</kbd> + <kbd>T</kbd> (Windows/Linux) or <kbd>Cmd</kbd> + <kbd>T</kbd> (macOS), type the initials of the symbol, and press Enter.
- Optionally, filter results by file name.

<img width="645" alt="Search Example" src="https://github.com/user-attachments/assets/929c650f-2128-4dc4-8a2e-3230775242cf" />

_Filtered results:_

<img width="627" alt="Filtered Search" src="https://github.com/user-attachments/assets/56ec2d7c-6fcd-4d75-be2f-bb9b26ff8ea4" />

---

### Go to Definition
Easily navigate to the definition of any Ruby symbol in your workspace.

**How to Use:**
- Press <kbd>F12</kbd> to go to the definition.
- Additional shortcuts:
  - <kbd>Ctrl</kbd> + <kbd>Click</kbd> or <kbd>Cmd</kbd> + <kbd>Click</kbd>: Jump to definition.
  - <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>Click</kbd> or <kbd>Cmd</kbd> + <kbd>Option</kbd> + <kbd>Click</kbd>: Open definition in a split view.
  - <kbd>Alt</kbd> + <kbd>F12</kbd> or <kbd>Option</kbd> + <kbd>F12</kbd>: Peek definition.

<img width="1070" alt="image" src="https://github.com/user-attachments/assets/fdf66618-f2da-4cc0-919e-ea4a0ce06bd9" />

---

### Outline View
Get an overview of all symbols in the current Ruby file with the **Outline View**, accessible in the Explorer sidebar. Symbols are displayed in a tree structure for better navigation.

<img width="966" alt="Outline View" src="https://github.com/user-attachments/assets/58eb53b2-8f41-4f54-858e-bbabee857a9b" />

---

### Go to Symbol in File
Easily navigate to any symbol within the currently open Ruby file.

**How to Use:**
- Press <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>O</kbd> (Windows/Linux) or <kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>O</kbd> (macOS).
- Type `:` to group symbols by category.

<img width="639" alt="Go to Symbol" src="https://github.com/user-attachments/assets/048fc6b1-7c07-43a5-9adc-898577495954" />

---

### Fuzzy Search
Search for Ruby symbols across your workspace using fuzzy matching.

**How to Use:**
- Press <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>R</kbd> (Windows/Linux) or <kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>R</kbd> (macOS).
- Filter results by appending the file name after `@`.

<img width="628" alt="image" src="https://github.com/user-attachments/assets/cb4e393c-6132-4606-8ddd-6b1bed2f0b34" />


_Filtered by file:_

<img width="619" alt="image" src="https://github.com/user-attachments/assets/b2da3de1-e989-4c7e-90e8-d606c2e614c1" />

**Note:** To customize the key binding:
1. Open **Keyboard Shortcuts** (<kbd>Ctrl</kbd> + <kbd>K</kbd> <kbd>Ctrl</kbd> + <kbd>S</kbd> or <kbd>Cmd</kbd> + <kbd>K</kbd> <kbd>Cmd</kbd> + <kbd>S</kbd>).
2. Search for `rubySymbolSearch.search`.
3. Modify the key binding as desired.

---

### List Symbols of a File
List symbols of any Ruby file in your workspace without opening the file.

**How to Use:**
- Press <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>R</kbd> (Windows/Linux) or <kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>R</kbd> (macOS).
- Type `@` followed by the file name to display the symbols.

<img width="621" alt="List Symbols" src="https://github.com/user-attachments/assets/2129565d-3ecb-4d48-9e67-aad8a373d0d6" />

---

### Lightning-Fast Indexing
- **Instant Indexing**: Quickly scans all Ruby files in the workspace to index symbols such as classes, modules, and methods.
- **Real-Time Updates**: Keeps the index in sync with changes to files.
- **Status Feedback**: Provides real-time indexing status in the status bar.

---

## Supported Ruby Symbols

The **Ruby Symbol Search** extension supports detection of the following Ruby symbols:

| Symbol Type       | Recognized Patterns |
|------------------|--------------------|
| **Classes** | `class ClassName` <br> `class << ClassName` |
| **Modules** | `module ModuleName` |
| **Methods** | `def method_name` |
| **Constants** | `CONSTANT_NAME = value` |
| **Scopes** | `scope :scope_name` |
| **Aliases** | `alias alias_name original_name` <br> `alias_method :alias_name, :original_name` <br> `alias_attribute :alias_name, :attribute_name` |
| **Attributes** | `attr_reader :attribute` <br> `attr_writer :attribute` <br> `attr_accessor :attribute` <br> `mattr_reader :attribute` <br> `mattr_writer :attribute` <br> `mattr_accessor :attribute` <br> `thread_mattr_accessor :attribute` <br> `attribute :attribute` <br> `date_attribute :attribute` <br> `class_attribute :attribute` <br> `attributes :attribute` <br> `delegate :method` |
| **Associations** | `belongs_to :association_name` <br> `has_one :association_name` <br> `has_many :association_name` <br> `has_and_belongs_to_many :association_name` |
| **Namespaces** | `namespace :namespace_name` |
| **Rake Tasks** | `task :task_name` |


## Commands
Access these commands from the Command Palette (<kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>P</kbd> or <kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>P</kbd>):

| Command                                   | Description                              |
|-------------------------------------------|------------------------------------------|
| **Ruby Symbol Search: Index Files**       | Re-index all Ruby files manually.        |
| **Ruby Symbol Search: Search Symbols**    | Open global Ruby symbol search.          |

---

## Installation

1. Install **Ruby Symbol Search** from the Visual Studio Code Marketplace.
2. Open a Ruby project in VS Code.
3. Indexing starts automatically if `autoIndex` is enabled (see [Configuration](#configuration)).

---

## Configuration

Customize the extension settings:

- **`rubySymbolSearch.autoIndex`** (default: `true`):  
  Automatically index Ruby symbols when opening a workspace.

- **`rubySymbolSearch.excludedFolders`** (default: `["node_modules", "log"]`):  
  Exclude specific folders from indexing.

---

## Troubleshooting

If you encounter issues with **duplicate symbols** appearing in **global search** or **file search**, this could be caused by conflicting extensions. Please try the following steps:

1. **Disable Ruby LSP Extension**:  
   - Ruby LSP will index symbols separately, leading to duplication.
   - Disable it by navigating to the Extensions view (<kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>X</kbd> or <kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>X</kbd>) and deactivating the Ruby LSP extension.

2. **Disable Ruby-Symbols Extension**:
   - If installed, this extension might conflict with Ruby Symbol Search.
   - Follow the same steps to disable it in the Extensions view.

---

## Contributing

We welcome contributions!  
If you encounter issues or have feature suggestions, please file an issue or a pull request in the [GitHub repository](https://github.com/bk-az/ruby-symbol-search).

---

## License

This project is licensed under the [MIT License](LICENSE).
