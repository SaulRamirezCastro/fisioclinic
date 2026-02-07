import React from "react";

type Props = {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
};

export default function SearchInput({
  placeholder = "Buscar...",
  value,
  onChange,
}: Props) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="border rounded px-3 py-2 w-full"
    />
  );
}
