export type MeasureUnit = "Kg" | "L" | "Unit";

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
  Kg: "Quilograma (kg)",
  L: "Litro (L)",
  Unit: "Unidade (un)",
};

export const MEASURE_UNIT_SHORT: Record<MeasureUnit, string> = {
  Kg: "kg",
  L: "L",
  Unit: "un",
};

export const MEASURE_UNIT_SMALLEST: Record<MeasureUnit, string> = {
  Kg: "g",
  L: "mL",
  Unit: "un",
};
