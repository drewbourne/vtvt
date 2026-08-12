import { formatPrice } from "../format/formatPrice";

export function Price({ value }: { value: number | null | undefined }) {
  if (value === null || value === undefined) {
    return "-";
  }

  return formatPrice(value);
}
