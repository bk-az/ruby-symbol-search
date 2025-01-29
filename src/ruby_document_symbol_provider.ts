import * as vscode from "vscode";
import FileParser from "./file_parser";
import { mapSymbolTypeToKind } from "./utility";

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
    const symbols = parser.getSymbols(); // Get symbols from the parser
    const documentSymbols: vscode.SymbolInformation[] = [];

    for (const symbol of symbols) {
      const symbolKind: vscode.SymbolKind = mapSymbolTypeToKind(symbol.type);

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
