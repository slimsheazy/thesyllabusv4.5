import React from 'react';

interface ProfileSelectorProps {
  isMe: boolean;
  onMe: () => void;
  onSomeoneElse: () => void;
  label?: string;
  className?: string;
}

export const ProfileSelector: React.FC<ProfileSelectorProps> = ({ 
  isMe, 
  onMe, 
  onSomeoneElse, 
  label = "Subject",
  className = ""
}) => {
  return (
    <div className={`flex justify-between items-center border-b border-black/5 pb-4 ${className}`}>
      <span className="handwritten text-[10px] opacity-40 uppercase tracking-widest">{label}</span>
      <div className="flex gap-2">
        <button 
          onClick={onMe}
          className={`px-3 py-1 text-[10px] font-mono uppercase border transition-all ${isMe ? 'bg-black text-white border-black' : 'border-black/10 opacity-40 hover:opacity-100'}`}
        >
          Me
        </button>
        <button 
          onClick={onSomeoneElse}
          className={`px-3 py-1 text-[10px] font-mono uppercase border transition-all ${!isMe ? 'bg-black text-white border-black' : 'border-black/10 opacity-40 hover:opacity-100'}`}
        >
          Someone Else
        </button>
      </div>
    </div>
  );
};
