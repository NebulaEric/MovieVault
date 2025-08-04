import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
<div className="fixed inset-0 bg-black/60 flex items-start justify-center z-[999] px-4 pt-[18vh]">
  <div className="relative bg-transparent p-8 rounded-lg w-full max-w-6xl">
    <button
      className="absolute top-2 right-3 text-[2.5rem] bg-none border-none cursor-pointer transition-transform hover:scale-125"
      onClick={onClose}
    >
      ×
    </button>
    {children}
  </div>
</div>
  );
};

export default Modal;
