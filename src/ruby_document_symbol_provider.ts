import * as vscode from "vscode";
import FileParser from "./file_parser";

export default class RubyDocumentSymbolProvider
  implements vscode.DocumentSymbolProvider
{
  async provideDocumentSymbols(
    document: vscode.TextDocument,
    token: vscode.CancellationToken
  ): Promise<vscode.DocumentSymbol[]> {
    const content = document.getText();
    const filePath = document.uri.fsPath;
    const parser = new FileParser(filePath, content);
    const config = vscode.workspace.getConfiguration("rubySymbolSearch");
    const enableDocumentSymbols = config.get<boolean>(
      "enableDocumentSymbols",
      true
    );

    if (!enableDocumentSymbols) {
      return [];
    }

    const symbols = parser.getSymbols(); // Get symbols from the parser
    const documentSymbols: vscode.DocumentSymbol[] = [];

    for (const symbol of symbols) {
      let symbolKind: vscode.SymbolKind;

      switch (symbol.type) {
        case "class":
          symbolKind = vscode.SymbolKind.Class;
          break;
        case "module":
          symbolKind = vscode.SymbolKind.Namespace;
          break;
        case "method":
          symbolKind = vscode.SymbolKind.Method;
          break;
        default:
          symbolKind = vscode.SymbolKind.Object;
      }

      const range = new vscode.Range(
        new vscode.Position(symbol.startLine - 1, 0),
        new vscode.Position(symbol.startLine - 1, 0)
      );

      const documentSymbol = new vscode.DocumentSymbol(
        symbol.symbol,
        "",
        symbolKind,
        range,
        range
      );

      documentSymbols.push(documentSymbol);
    }

    return documentSymbols;
  }
}
