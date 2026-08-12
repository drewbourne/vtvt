export function formatNullish(value: unknown, placeholder: string = "-") {
  return value ?? placeholder;
}
