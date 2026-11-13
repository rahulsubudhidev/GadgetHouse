import React from 'react';
import { MessageSquareText } from 'lucide-react';

export const WhatsAppButton: React.FC = () => {
  return (
    <a
      href="https://wa.me/919437188200?text=Hi%20Gadget%20House,%20I%20need%20help%20choosing%20accessories%20for%20my%20phone"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 left-6 z-40 w-12 h-12 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white flex items-center justify-center shadow-2xl transition-all transform hover:scale-110 shadow-emerald-500/30 group"
      title="Chat with Gadget House on WhatsApp"
    >
      <MessageSquareText className="w-6 h-6" />
      <span className="absolute left-full ml-3 bg-black/90 text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none border border-white/10">
        Chat with Support
      </span>
    </a>
  );
};

