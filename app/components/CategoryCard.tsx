import React from "react";

type Props = { title: string; status: boolean };

export default function CategoryCard({ title, status }: Props) {
  return (
    <div className="border rounded-xl p-4 flex justify-between items-center bg-white shadow-sm">
      <span className="font-semibold text-gray-800">{title}</span>
      <span className={`px-3 py-1 rounded-full text-sm font-medium 
        ${status ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}
      `}>
        {status ? "PASS" : "FAIL"}
      </span>
    </div>
  );
}
