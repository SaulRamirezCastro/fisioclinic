import React from "react";

type Props = {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary";
  type?: "button" | "submit";
};

export default function Button({
  children,
  onClick,
  variant = "primary",
  type = "button",
}: Props) {
  const styles =
    variant === "primary"
      ? "bg-blue-600 hover:bg-blue-700 text-white"
      : "bg-gray-200 hover:bg-gray-300 text-gray-800";

  return (
    <button
      type={type}
      onClick={onClick}
      className={`px-4 py-2 rounded font-medium ${styles}`}
    >
      {children}
    </button>
  );
}
