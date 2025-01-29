import * as vscode from "vscode";
import { SymbolSearchResult, SymbolType } from "./types";

const symbolKindMap: Partial<Record<SymbolType, vscode.SymbolKind>> = {
  class: vscode.SymbolKind.Class,
  module: vscode.SymbolKind.Module,
  method: vscode.SymbolKind.Method,
  attribute: vscode.SymbolKind.Method,
  association: vscode.SymbolKind.Interface,
  alias: vscode.SymbolKind.Method,
  constant: vscode.SymbolKind.Constant,
  namespace: vscode.SymbolKind.Namespace,
  task: vscode.SymbolKind.Method,
  scope: vscode.SymbolKind.Method,
};

export function mapSymbolTypeToKind(type: SymbolType): vscode.SymbolKind {
  return symbolKindMap[type] || vscode.SymbolKind.Object;
}

export function mapSearchResultsToSymbols(
  searchResults: SymbolSearchResult[]
): vscode.SymbolInformation[] {
  const result: vscode.SymbolInformation[] = [];
  for (const entry of searchResults) {
    if (entry.locations.length === 0) {
      continue;
    }

    entry.locations.forEach((location) => {
      result.push(
        new vscode.SymbolInformation(
          entry.symbol,
          mapSymbolTypeToKind(location.type),
          "",
          new vscode.Location(
            vscode.Uri.file(location.file),
            new vscode.Position(location.startLine - 1, 0)
          )
        )
      );
    });
  }

  return result;
}

export function mapSymbolTypeToIcon(type: SymbolType): string {
  switch (type) {
    case "class":
      return "$(symbol-class)";
    case "module":
      return "$(symbol-namespace)";
    case "method":
      return "$(symbol-method)";
    case "constant":
      return "$(symbol-constant)";
    case "scope":
      return "$(symbol-method)";
    case "alias":
      return "$(symbol-method)";
    case "attribute":
      return "$(symbol-method)";
    case "association":
      return "$(symbol-interface)";
    case "namespace":
      return "$(symbol-namespace)";
    case "task":
      return "$(symbol-method)";
  }

  return "$(symbol-method)";
}
