export type SymbolType =
  | "class"
  | "module"
  | "method"
  | "constant"
  | "scope"
  | "alias"
  | "accessor"
  | "association";

export interface BaseSymbol {
  file: string;
  line: number;
  type: SymbolType;
}

export interface Symbol extends BaseSymbol {
  symbol: string;
}

export interface SymbolLocation extends BaseSymbol {}

export interface SymbolDetail {
  id: number;
  locations: SymbolLocation[];
}

export interface SymbolSearchEntry {
  symbol: string;
  locations: SymbolLocation[];
}

export interface FileData {
  id: number;
  symbolIds: number[];
}

export type GlobalSymbols = Record<string, SymbolDetail>;
export type FileSymbols = Record<string, FileData>;

export interface GlobalSearchItem {
  label: string;
  alwaysShow: boolean;
  entry: SymbolSearchEntry;
}

export interface MultiMatchItem {
  label: string;
  location: SymbolLocation;
  detail: string;
}
