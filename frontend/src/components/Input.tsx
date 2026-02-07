import React from "react";
type Props = {
  label: string;
  value: string;
  onChange: (e: any) => void;
  type?: string;
};

export default function Input({ label, value, onChange, type = "text" }: Props) {
  return (
    <div className="mb-3">
      <label className="block text-sm mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        className="w-full border rounded px-3 py-2"
      />
    </div>
  );
}
