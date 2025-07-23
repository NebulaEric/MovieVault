import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[999]">
      <div className="relative bg-transparent p-8 rounded-lg min-w-[300px]">
        <button className="absolute top-2 right-3 text-[2.5rem] bg-none border-none cursor-pointer" onClick={onClose}>×</button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
