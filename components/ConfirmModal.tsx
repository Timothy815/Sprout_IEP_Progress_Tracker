import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ isOpen, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 transform scale-100 animate-in zoom-in-95 duration-200 border-2 border-slate-100">
        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle size={28} />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Delete Item?</h3>
          <p className="text-slate-600 mb-6 text-sm leading-relaxed whitespace-pre-wrap">{message}</p>
          
          <div className="flex gap-3 w-full">
            <button 
              onClick={onCancel}
              className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={onConfirm}
              className="flex-1 px-4 py-2 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;