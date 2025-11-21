import { InputHTMLAttributes, useEffect, useState } from "react";
import { Input } from "../ui/input";

export function DebouncedInput({
    value: initialValue,
    onChange,
    ...props
}: {
    value: string | number;
    onChange: (value: string | number) => void;
    debounce?: number;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "onChange">) {
    const [value, setValue] = useState(initialValue);

    useEffect(() => {
        setValue(initialValue);
    }, [initialValue]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            onChange(value);
        }, 1000);

        return () => clearTimeout(timeout);
    }, [value, onChange]);

    return <Input id="input_search_table" {...props} value={value} onChange={(e) => setValue(e.target.value)} />;
}