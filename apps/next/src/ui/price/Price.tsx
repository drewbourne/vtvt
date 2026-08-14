import { formatPrice } from "../format/formatPrice";

export function Price({
  value,
  p,
}: {
  value: number | null | undefined;
  p?: number;
}) {
  if (value === null || value === undefined) {
    return "-";
  }

  return formatPrice(value, p);
}
