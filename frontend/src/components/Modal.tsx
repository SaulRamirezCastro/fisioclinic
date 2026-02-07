import React from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

export default function Modal({ open, onClose, children }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-6 rounded w-96">
        {children}
        <div className="mt-4 text-right">
          <button onClick={onClose} className="text-sm text-gray-500">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
