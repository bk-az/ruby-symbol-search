// Import required modules
import * as vscode from "vscode";
import SymbolStore from "./symbol_store";
import LiveSearch from "./live_search";
import RubyDocumentSymbolProvider from "./ruby_document_symbol_provider";

const config = vscode.workspace.getConfiguration("rubySymbolSearch");
const autoIndex = config.get<boolean>("autoIndex", true);
let symbolStore = new SymbolStore();

async function indexRubyFiles() {
  symbolStore = new SymbolStore();
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
  const search = new LiveSearch(symbolStore);
  search.init();
}

export function activate(context: vscode.ExtensionContext) {
  const documentSymbolProvider =
    vscode.languages.registerDocumentSymbolProvider(
      { scheme: "file", language: "ruby" },
      new RubyDocumentSymbolProvider()
    );

  context.subscriptions.push(documentSymbolProvider);
  const indexCommand = vscode.commands.registerCommand(
    "rubySymbolSearch.index",
    indexRubyFiles
  );
  const searchCommand = vscode.commands.registerCommand(
    "rubySymbolSearch.search",
    searchRubySymbolsLive
  );

  context.subscriptions.push(indexCommand);
  context.subscriptions.push(searchCommand);

  if (autoIndex) {
    indexRubyFiles();
  }

  watchFileChanges(context);
}

export function deactivate() {}
