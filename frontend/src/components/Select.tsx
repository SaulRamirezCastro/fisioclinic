import React from "react";
type Props = {
  label: string;
  value: string;
  onChange: (e: any) => void;
  options: { value: string; label: string }[];
};

export default function Select({ label, value, onChange, options }: Props) {
  return (
    <div className="mb-3">
      <label className="block text-sm mb-1">{label}</label>
      <select
        value={value}
        onChange={onChange}
        className="w-full border rounded px-3 py-2"
      >
        <option value="">Seleccionar</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
