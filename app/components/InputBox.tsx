import React from "react";

export default function InputBox({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  return (
    <input
      type="text"
      className="w-full border rounded-lg p-3 shadow-sm text-lg"
      placeholder="Masukkan kode saham (ex: BBCA)"
      value={value}
      onChange={(e) => onChange(e.target.value.toUpperCase())}
    />
  );
}
