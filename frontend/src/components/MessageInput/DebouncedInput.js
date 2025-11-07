import React, { useEffect, useState } from "react";
import TextField from "@material-ui/core/TextField";

export function DebouncedInput({ value: initialValue, disabled = false, onChange, debounce = 1000, ...props }) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value);
    }, debounce);

    return () => clearTimeout(timeout);
  }, [value, onChange, debounce]);

  return (
    <TextField
      {...props}
      variant='outlined'
      value={value}
      label='Pesquisar Produto (nome ou EAN)'
      onChange={(e) => setValue(e.target.value)}
      disabled={disabled}
    />
  );
}
