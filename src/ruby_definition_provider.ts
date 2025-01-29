import * as vscode from "vscode";
import SymbolStore from "./symbol_store";

export class RubyDefinitionProvider implements vscode.DefinitionProvider {
  symbolStore: SymbolStore;

  constructor(symbolStore: SymbolStore) {
    this.symbolStore = symbolStore;
  }

  public async provideDefinition(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken
  ): Promise<vscode.Location[] | null> {
    const wordRange = document.getWordRangeAtPosition(position);

    if (!wordRange) {
      return null;
    }

    let word = document.getText(wordRange);
    const nextCharPosition = wordRange.end.character;
    const lineText = document.lineAt(position.line).text;
    const nextChar = lineText.charAt(nextCharPosition);

    if (nextChar === "!" || nextChar === "?") {
      word += nextChar;
    }

    const symbolInfo = this.symbolStore.getSymbolInformation(word);

    if (!symbolInfo || !symbolInfo.locations) {
      return null;
    }

    if (symbolInfo.locations.length === 1) {
      const location = symbolInfo.locations[0];
      return [
        new vscode.Location(
          vscode.Uri.file(location.file),
          new vscode.Position(location.startLine - 1, 0)
        ),
      ];
    }

    const currentFileSymbol = symbolInfo.locations.find(
      (l) => l.file === document.fileName
    );

    if (currentFileSymbol) {
      return [
        new vscode.Location(
          document.uri,
          new vscode.Position(currentFileSymbol.startLine - 1, 0)
        ),
      ];
    }

    const locations = symbolInfo.locations.map((l) => {
      return new vscode.Location(
        vscode.Uri.file(l.file),
        new vscode.Position(l.startLine - 1, 0)
      );
    });

    return new Promise((resolve) => {
      return resolve(locations);
    });
  }
}
