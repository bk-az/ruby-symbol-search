import * as vscode from "vscode";
import * as path from "path";
import { GlobalSearchItem, SymbolLocation } from "./types";
import SymbolStore from "./symbol_store";
import Formatter from "./formatter";

export default class LiveSearch {
  symbolStore: SymbolStore;
  quickPick: vscode.QuickPick<GlobalSearchItem>;
  basePath: string;

  constructor(symbolStore: SymbolStore, basePath: string) {
    this.symbolStore = symbolStore;
    this.quickPick = vscode.window.createQuickPick();
    this.quickPick.placeholder = "Type to search for Ruby symbols";
    this.basePath = basePath;
  }
  init() {
    this.registerEventHandlers();
    this.quickPick.show();
  }

  registerEventHandlers() {
    this.registerOnChange();
    this.registerOnSelect();
    this.quickPick.onDidHide(() => this.quickPick.dispose());
  }

  registerOnChange() {
    this.quickPick.onDidChangeValue((query) => {
      if (query.trim() === "") {
        this.quickPick.items = [];
        return;
      }

      const searchResults = this.symbolStore.search(query);
      if (searchResults.length > 0) {
        this.quickPick.items = new Formatter().format(searchResults);
      } else {
        this.quickPick.items = [
          {
            label: "No matches found",
            alwaysShow: true,
            entry: null as any,
          },
        ];
      }
    });
  }

  registerOnSelect() {
    this.quickPick.onDidAccept(() => {
      const selected = this.quickPick.selectedItems[0];
      if (selected && selected.entry) {
        const locations = selected.entry.locations;

        if (locations.length > 1) {
          const matchOptions = new Formatter().formatNested(selected.entry);
          vscode.window
            .showQuickPick(matchOptions, {
              placeHolder: "Select a file for the symbol",
            })
            .then((fileSelected) => {
              if (fileSelected && fileSelected.location) {
                this.goToLocation(fileSelected.location);
              }
            });
        } else if (locations.length === 1) {
          this.goToLocation(locations[0]);
        }
      }
      this.quickPick.hide();
    });
  }

  goToLocation(location: SymbolLocation) {
    const { file, line } = location;
    vscode.workspace
      .openTextDocument(this.getFullPath(file))
      .then((document) => {
        vscode.window.showTextDocument(document).then((editor) => {
          const position = new vscode.Position(line - 1, 0);
          editor.selection = new vscode.Selection(position, position);
          editor.revealRange(new vscode.Range(position, position));
        });
      });
  }

  getFullPath(relativePath: string): string {
    return path.resolve(this.basePath, relativePath);
  }
}
