// Import required modules
import * as vscode from "vscode";
import SymbolStore from "./symbol_store";
import LiveSearch from "./live_search";

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
  const search = new LiveSearch(symbolStore, getBasePath());
  search.init();
}

function getBasePath() {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders) {
    return "";
  }

  return workspaceFolders[0].uri.fsPath;
}

export function activate(context: vscode.ExtensionContext) {
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
    vscode.window.showInformationMessage(
      "Auto-indexing Ruby symbols on startup..."
    );
    indexRubyFiles();
  }

  watchFileChanges(context);

  vscode.window.showInformationMessage(
    "Ruby Symbol Search extension is active."
  );
}

export function deactivate() {}
