import * as vscode from "vscode";
import FileParser from "./file_parser";

export default class RubyDocumentSymbolProvider
  implements vscode.DocumentSymbolProvider
{
  async provideDocumentSymbols(
    document: vscode.TextDocument,
    token: vscode.CancellationToken
  ): Promise<vscode.SymbolInformation[]> {
    const content = document.getText();
    const filePath = document.uri.fsPath;
    const parser = new FileParser(filePath, content, {
      fetchDetails: true,
    });
    const config = vscode.workspace.getConfiguration("rubySymbolSearch");
    const enableDocumentSymbols = config.get<boolean>(
      "enableDocumentSymbols",
      true
    );

    if (!enableDocumentSymbols) {
      return [];
    }

    const symbols = parser.getSymbols(); // Get symbols from the parser
    const documentSymbols: vscode.SymbolInformation[] = [];

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
        case "attr":
          symbolKind = vscode.SymbolKind.Field;
          break;
        case "association":
          symbolKind = vscode.SymbolKind.Interface;
          break;
        case "alias":
          symbolKind = vscode.SymbolKind.Field;
          break;
        case "constant":
          symbolKind = vscode.SymbolKind.Constant;
          break;
        default:
          symbolKind = vscode.SymbolKind.Object;
      }

      var range = new vscode.Range(
        new vscode.Position(symbol.startLine - 1, 0),
        new vscode.Position((symbol.endLine || symbol.startLine) - 1, 0)
      );
      const location = new vscode.Location(vscode.Uri.file(symbol.file), range);

      const documentSymbol = new vscode.SymbolInformation(
        symbol.symbol,
        symbolKind,
        "",
        location
      );

      documentSymbols.push(documentSymbol);
    }

    return documentSymbols;
  }
}
