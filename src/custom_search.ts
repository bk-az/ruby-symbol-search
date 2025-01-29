import * as vscode from "vscode";
import { DropDownItem, SymbolLocation } from "./types";
import CustomSearchFormatter from "./custom_search_formatter";
import SymbolStore from "./symbol_store";

export default class CustomSearch {
  symbolStore: SymbolStore;
  quickPick: vscode.QuickPick<DropDownItem>;

  constructor(symbolStore: SymbolStore) {
    this.symbolStore = symbolStore;
    this.quickPick = vscode.window.createQuickPick();
    this.quickPick.matchOnDetail = true;
    this.quickPick.placeholder =
      "Type to search for Ruby symbols. Use '@' followed by a filename to filter results by the filename";
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
        this.quickPick.items = new CustomSearchFormatter().formatGlobalResults(
          searchResults
        );
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
      if (selected && selected.entry && "locations" in selected.entry) {
        const locations = selected.entry.locations;

        if (locations.length > 1) {
          const matchOptions = new CustomSearchFormatter().formatFileResults(
            selected.entry
          );
          vscode.window
            .showQuickPick(matchOptions, {
              placeHolder:
                "Multiple matches found. Refine your search by typing the filename to locate the desired symbol.",
              matchOnDetail: true,
            })
            .then((fileSelected) => {
              if (fileSelected && fileSelected.entry) {
                this.goToLocation(fileSelected.entry as SymbolLocation);
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
    const { file, startLine } = location;
    vscode.workspace.openTextDocument(file).then((document) => {
      vscode.window.showTextDocument(document).then((editor) => {
        const position = new vscode.Position(startLine - 1, 0);
        editor.selection = new vscode.Selection(position, position);
        editor.revealRange(new vscode.Range(position, position));
      });
    });
  }
}
