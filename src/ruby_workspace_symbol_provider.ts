import * as vscode from "vscode";
import SymbolStore from "./symbol_store";
import { mapSearchResultsToSymbols } from "./utility";

export default class RubyWorkspaceSymbolProvider
  implements vscode.WorkspaceSymbolProvider
{
  symbolStore: SymbolStore;

  constructor(symbolStore: SymbolStore) {
    this.symbolStore = symbolStore;
  }

  async provideWorkspaceSymbols(
    query: string,
    token: vscode.CancellationToken
  ): Promise<vscode.SymbolInformation[]> {
    let symbols: vscode.SymbolInformation[] = [];
    if (query) {
      const searchResults = this.symbolStore.search(query, {
        limit: 10,
        fileSearch: false,
      });
      console.log(
        query,
        searchResults.map((e) => e.symbol)
      );
      symbols = mapSearchResultsToSymbols(searchResults);
    }

    return symbols;
  }
}
