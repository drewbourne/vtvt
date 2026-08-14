"use client";

import { ChangeEvent, ChangeEventHandler, ReactNode, useCallback } from "react";
import { Field, useFieldSva } from "./Field";

function SearchInput({
  defaultValue,
  value,
  onChange,
}: {
  defaultValue?: string;
  value?: string;
  onChange?: ChangeEventHandler;
}) {
  const classes = useFieldSva();

  return (
    <input
      className={classes.control}
      type="search"
      defaultValue={defaultValue}
      value={value}
      onChange={onChange}
    />
  );
}

export function SearchField({
  label = "Search",
  onChange,
  onSearch,
  ...props
}: {
  label: ReactNode;
  defaultValue?: string;
  value?: string;
  onChange?: ChangeEventHandler;
  onSearch?: (value: string) => void;
}) {
  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      onChange?.(event);

      if (event.isDefaultPrevented()) return;

      onSearch?.(event.currentTarget.value);
    },
    [onChange, onSearch],
  );

  return (
    <Field
      label={label}
      input={<SearchInput {...props} onChange={handleChange} />}
    />
  );
}
