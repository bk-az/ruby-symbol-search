// Import required modules
import * as vscode from "vscode";
import SymbolStore from "./symbol_store";
import CustomSearch from "./custom_search";
import RubyDocumentSymbolProvider from "./ruby_document_symbol_provider";
import RubyWorkspaceSymbolProvider from "./ruby_workspace_symbol_provider";
import { RubyDefinitionProvider } from "./ruby_definition_provider";

const config = vscode.workspace.getConfiguration("rubySymbolSearch");
const autoIndex = config.get<boolean>("autoIndex", true);
let symbolStore = new SymbolStore();

async function indexRubyFiles() {
  await symbolStore.index();
}

function watchFileChanges(context: vscode.ExtensionContext) {
  if (!autoIndex) {
    return;
  }

  const watcher = vscode.workspace.createFileSystemWatcher("**/*.rb");

  watcher.onDidChange((uri) => {
    symbolStore.indexRubyFile(uri.fsPath);
  });

  watcher.onDidCreate((uri) => {
    symbolStore.indexRubyFile(uri.fsPath);
  });

  watcher.onDidDelete((uri) => {
    symbolStore.removeFileSymbols(uri.fsPath);
  });

  context.subscriptions.push(watcher);
}

async function searchRubySymbolsLive() {
  const search = new CustomSearch(symbolStore);
  search.init();
}

export function activate(context: vscode.ExtensionContext) {
  const documentSymbolProvider =
    vscode.languages.registerDocumentSymbolProvider(
      {
        language: "ruby",
        scheme: "file",
        pattern: "**/*.{rb,rake}",
      },
      new RubyDocumentSymbolProvider()
    );

  const workspaceSymbolProvider =
    vscode.languages.registerWorkspaceSymbolProvider(
      new RubyWorkspaceSymbolProvider(symbolStore)
    );

  const definitionProvider = vscode.languages.registerDefinitionProvider(
    {
      language: "ruby",
      scheme: "file",
      pattern: "**/*.{rb,rake,erb,slim}",
    },
    new RubyDefinitionProvider(symbolStore)
  );

  const indexCommand = vscode.commands.registerCommand(
    "rubySymbolSearch.index",
    indexRubyFiles
  );
  const searchCommand = vscode.commands.registerCommand(
    "rubySymbolSearch.search",
    searchRubySymbolsLive
  );

  context.subscriptions.push(documentSymbolProvider);
  context.subscriptions.push(workspaceSymbolProvider);
  context.subscriptions.push(definitionProvider);
  context.subscriptions.push(indexCommand);
  context.subscriptions.push(searchCommand);

  if (autoIndex) {
    indexRubyFiles();
  }

  watchFileChanges(context);
}

export function deactivate() {}
