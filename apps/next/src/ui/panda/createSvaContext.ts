import {
  SlotRecipeRuntimeFn,
  SlotRecipeVariantRecord,
} from "@styled-system/types";
import { createContext, useContext } from "react";

export function createSvaContext<
  S extends string,
  T extends SlotRecipeVariantRecord<S>,
>() {
  type SlotClasses = ReturnType<SlotRecipeRuntimeFn<S, T>>;

  const context = createContext<{ classes: SlotClasses } | null>(null);

  const use = () => useContext(context);

  return { context, Provider: context.Provider, use };
}
