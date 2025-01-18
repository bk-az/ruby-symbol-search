import * as vscode from "vscode";
import { SymbolSearchEntry, GlobalSearchItem, MultiMatchItem } from "./types";

export default class Formatter {
  constructor() {}

  format(searchResults: SymbolSearchEntry[]): GlobalSearchItem[] {
    const result: GlobalSearchItem[] = [];
    for (const entry of searchResults) {
      if (entry.locations.length === 0) {
        continue;
      }

      let icon = this.defaultIcon();
      if (entry.locations.length === 1) {
        const location = entry.locations[0];
        icon = this.getIcon(location.type);
      }

      result.push({
        label: `${icon} ${entry.symbol}`,
        alwaysShow: true,
        entry,
      });
    }

    return result;
  }

  formatNested(item: SymbolSearchEntry): MultiMatchItem[] {
    const result: MultiMatchItem[] = [];
    for (const entry of item.locations) {
      const icon = this.getIcon(entry.type);

      const relativePath = vscode.workspace.asRelativePath(entry.file);
      result.push({
        label: `${icon} ${item.symbol}`,
        detail: `${relativePath}:${entry.line}`,
        location: entry,
      });
    }

    return result;
  }

  defaultIcon(): string {
    return "$(symbol-method)";
  }

  getIcon(type: string): string {
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
        return "$(filter)";
      case "alias":
        return "$(copy)";
      case "accessor":
        return "$(symbol-variable)";
      case "association":
        return "$(link)";
    }

    return this.defaultIcon();
  }
}
