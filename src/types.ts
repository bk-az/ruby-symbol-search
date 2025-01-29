export type SymbolType =
  | "class"
  | "module"
  | "method"
  | "constant"
  | "scope"
  | "alias"
  | "attribute"
  | "delegate"
  | "association"
  | "if"
  | "unless"
  | "while"
  | "until"
  | "for"
  | "case"
  | "begin"
  | "do"
  | "block"
  | "namespace"
  | "task"
  | "comment"
  | "end"
  | "unknown";

export interface OpenBlock {
  type: SymbolType;
  indentation: string;
  symbol: string;
  startLine: number;
}

export interface ParsedToken {
  state: "open" | "close" | "complete";
  symbol: string;
  type: SymbolType;
}

export interface FileMetaData {
  id: number;
  symbolIds: number[];
}
export interface SymbolLocation {
  file: string;
  startLine: number;
  type: SymbolType;
}
export interface Symbol extends SymbolLocation {
  symbol: string;
  endLine?: number;
  detail?: string;
}

export interface SymbolGroup {
  id: number;
  locations: SymbolLocation[];
}

export interface SymbolSearchResult {
  symbol: string;
  locations: SymbolLocation[];
}

export interface DropDownItem {
  label: string;
  alwaysShow?: boolean;
  detail?: string;
  entry: SymbolSearchResult | SymbolLocation;
}

export type GroupedSymbols = Record<string, SymbolGroup>;
export type FileSymbols = Record<string, FileMetaData>;
