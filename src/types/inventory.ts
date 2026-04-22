export type MeasureUnit = "ML" | "G" | "U";

export interface InventoryMaterial {
  id: string;
  name: string;
  quantity: number;
  unitCost: number;
  measureUnit: MeasureUnit;
  status: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryDropdownItem {
  id: string;
  name: string;
  measureUnit: MeasureUnit;
}

export interface RecipeItem {
  materialId: string;
  materialName: string;
  quantity: number;
  measureUnit: MeasureUnit;
}

export interface ProductRecipe {
  hasRecipe: boolean;
  items: RecipeItem[];
}

export interface CreateMaterialInput {
  name: string;
  quantity: number;
  totalCost: number;
  measureUnit: MeasureUnit;
}

export interface UpdateMaterialInput {
  name: string;
  measureUnit: MeasureUnit;
}

export interface RestockInput {
  quantity: number;
  totalCost: number;
}

export interface SetRecipeInput {
  items: Array<{ materialId: string; quantity: number }>;
}

export const MEASURE_UNIT_LABEL: Record<MeasureUnit, string> = {
  G:  "Gramas (g)",
  ML: "Mililitros (mL)",
  U:  "Unidade (u)",
};

export const MEASURE_UNIT_SHORT: Record<MeasureUnit, string> = {
  G:  "g",
  ML: "mL",
  U:  "u",
};
