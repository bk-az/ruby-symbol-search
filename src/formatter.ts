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
      let summary = "";
      if (entry.locations.length === 1) {
        const location = entry.locations[0];
        icon = this.getIcon(location.type);
        summary = `${vscode.workspace.asRelativePath(location.file)}:${
          location.startLine
        }`;
      } else {
        const typeCounts = entry.locations.reduce(
          (counts: Record<string, number>, location) => {
            const type = location.type;
            counts[type] = (counts[type] || 0) + 1;
            return counts;
          },
          {}
        );
        const sortedCounts = Object.fromEntries(
          Object.entries(typeCounts).sort(
            ([, valueA], [, valueB]) => valueA - valueB
          )
        );
        summary = Object.keys(sortedCounts)
          .reduce((list: string[], type) => {
            list.push(`${this.getIcon(type)}(${sortedCounts[type]})`);
            return list;
          }, [])
          .join(",");
        summary = `$(indent) ${summary}`;
      }

      result.push({
        label: `${icon} ${entry.symbol}`.trim(),
        detail: summary,
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
        detail: `${relativePath}:${entry.startLine}`,
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
      case "attr":
        return "$(symbol-variable)";
      case "association":
        return "$(link)";
    }

    return this.defaultIcon();
  }
}
