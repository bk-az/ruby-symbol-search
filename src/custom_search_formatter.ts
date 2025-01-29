import * as vscode from "vscode";
import { SymbolSearchResult, DropDownItem } from "./types";
import { mapSymbolTypeToIcon } from "./utility";

export default class CustomSearchFormatter {
  constructor() {}

  formatGlobalResults(searchResults: SymbolSearchResult[]): DropDownItem[] {
    const result: DropDownItem[] = [];
    for (const entry of searchResults) {
      if (entry.locations.length === 0) {
        continue;
      }

      let icon = "$(symbol-method)";
      let summary = "";
      if (entry.locations.length === 1) {
        const location = entry.locations[0];
        icon = mapSymbolTypeToIcon(location.type);
        summary = `${vscode.workspace.asRelativePath(location.file)}:${
          location.startLine
        }`;
      } else {
        const typeCounts: Record<string, number> = {};
        entry.locations.forEach((location) => {
          const iconType = mapSymbolTypeToIcon(location.type);
          typeCounts[iconType] = (typeCounts[iconType] || 0) + 1;
        });

        const sortedCounts = Object.fromEntries(
          Object.entries(typeCounts).sort(
            ([, valueA], [, valueB]) => valueA - valueB
          )
        );

        summary = Object.keys(sortedCounts)
          .reduce((list: string[], type) => {
            list.push(`${type}(${sortedCounts[type]})`);
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

  formatFileResults(item: SymbolSearchResult): DropDownItem[] {
    const result: DropDownItem[] = [];
    for (const entry of item.locations) {
      const icon = mapSymbolTypeToIcon(entry.type);

      const relativePath = vscode.workspace.asRelativePath(entry.file);
      result.push({
        label: `${icon} ${item.symbol}`,
        detail: `${relativePath}:${entry.startLine}`,
        entry: entry,
      });
    }

    return result;
  }
}
