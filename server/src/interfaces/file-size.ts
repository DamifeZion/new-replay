type SizeUnitT = "kb" | "mb" | "gb";

export interface FileSizeI {
	(size: number, unit: SizeUnitT): number;
}
