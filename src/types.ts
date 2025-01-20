export type SymbolType =
  | "class"
  | "module"
  | "method"
  | "constant"
  | "scope"
  | "alias"
  | "attr"
  | "association"
  | "class"
  | "module"
  | "method"
  | "if"
  | "unless"
  | "while"
  | "until"
  | "for"
  | "case"
  | "begin"
  | "do"
  | "block"
  | "comment"
  | "end"
  | "unknown";

export interface OpenBlock {
  type: SymbolType;
  symbol: string;
  startLine: number;
}

export interface ParsedToken {
  kind: "open" | "close" | "complete";
  symbol: string;
  type: SymbolType;
}

export interface FileData {
  id: number;
  symbolIds: number[];
}
export interface BaseSymbol {
  file: string;
  startLine: number;
  type: SymbolType;
}
export interface Symbol extends BaseSymbol {
  symbol: string;
  endLine?: number;
  detail?: string;
}

export interface SymbolLocation extends BaseSymbol {}

export interface GlobalSymbol {
  id: number;
  locations: SymbolLocation[];
}

export interface SymbolSearchEntry {
  symbol: string;
  locations: SymbolLocation[];
}

export interface GlobalSearchItem {
  label: string;
  alwaysShow: boolean;
  detail?: string;
  entry: SymbolSearchEntry;
}

export interface MultiMatchItem {
  label: string;
  location: SymbolLocation;
  detail: string;
}

export type GlobalSymbols = Record<string, GlobalSymbol>;
export type FileSymbols = Record<string, FileData>;
