import { useState } from 'react';
import { 
  X, Check, Layout, ArrowRight
} from 'lucide-react';
import { EMAIL_TEMPLATES } from '../data/emailTemplates';
import type { TemplateId } from '../data/emailTemplates';

interface GalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTemplateId: TemplateId;
  onSelectTemplate: (id: TemplateId) => void;
}

const TemplateGalleryModal = ({ 
  isOpen, 
  onClose, 
  selectedTemplateId, 
  onSelectTemplate 
}: GalleryModalProps) => {
  const [filterCategory, setFilterCategory] = useState<'all' | 'direct' | 'promotional' | 'newsletter' | 'ecommerce'>('all');

  if (!isOpen) return null;

  const templateList = Object.values(EMAIL_TEMPLATES);
  const filteredTemplates = filterCategory === 'all' 
    ? templateList 
    : templateList.filter(t => t.category === filterCategory);

  // Structural Wireframe Diagrams corresponding to Link Mobility specifications
  const renderWireframe = (id: TemplateId) => {
    switch (id) {
      case 'text_only':
        return (
          <div className="w-full h-32 bg-gray-50 border border-gray-200 rounded-lg p-3 flex flex-col justify-between">
            <div className="w-12 h-2.5 bg-gray-300 rounded-sm mb-2" />
            <div className="w-3/4 h-3 bg-gray-800 rounded-xs mb-2" />
            <div className="space-y-1.5 mb-2">
              <div className="w-full h-1.5 bg-gray-300 rounded-xs" />
              <div className="w-5/6 h-1.5 bg-gray-300 rounded-xs" />
              <div className="w-4/6 h-1.5 bg-gray-300 rounded-xs" />
            </div>
            <div className="space-y-1 mb-2 pl-2 border-l-2 border-accent">
              <div className="w-3/4 h-1.5 bg-gray-400 rounded-xs" />
              <div className="w-2/3 h-1.5 bg-gray-400 rounded-xs" />
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-xs pt-0.5" />
          </div>
        );

      case 'one_column':
        return (
          <div className="w-full h-32 bg-gray-50 border border-gray-200 rounded-lg p-3 flex flex-col items-center justify-between">
            <div className="w-12 h-2.5 bg-gray-300 rounded-sm" />
            <div className="w-4/5 h-3 bg-gray-800 rounded-xs" />
            <div className="w-full h-11 bg-accent/20 border border-accent/40 rounded-md flex items-center justify-center text-[9px] font-bold text-accent">
              Hero Banner Image
            </div>
            <div className="w-24 h-4 bg-accent text-white rounded-md flex items-center justify-center text-[8px] font-bold shadow-xs">
              Primary CTA
            </div>
            <div className="w-full h-1.5 bg-gray-200 rounded-xs" />
          </div>
        );

      case 'two_column':
        return (
          <div className="w-full h-32 bg-gray-50 border border-gray-200 rounded-lg p-3 flex flex-col justify-between">
            <div className="flex justify-between items-center">
              <div className="w-12 h-2.5 bg-gray-300 rounded-sm" />
              <div className="w-20 h-2 bg-gray-400 rounded-xs" />
            </div>
            <div className="grid grid-cols-2 gap-2 my-1">
              <div className="bg-white border border-gray-200 p-1.5 rounded-md flex flex-col items-center space-y-1">
                <div className="w-full h-8 bg-blue-100 rounded-xs" />
                <div className="w-3/4 h-2 bg-gray-700 rounded-xs" />
                <div className="w-12 h-3 bg-blue-600 rounded-xs" />
              </div>
              <div className="bg-white border border-gray-200 p-1.5 rounded-md flex flex-col items-center space-y-1">
                <div className="w-full h-8 bg-purple-100 rounded-xs" />
                <div className="w-3/4 h-2 bg-gray-700 rounded-xs" />
                <div className="w-12 h-3 bg-purple-600 rounded-xs" />
              </div>
            </div>
            <div className="w-full h-1.5 bg-gray-200 rounded-xs" />
          </div>
        );

      case 'hybrid':
        return (
          <div className="w-full h-32 bg-gray-50 border border-gray-200 rounded-lg p-3 flex flex-col justify-between">
            <div className="w-10 h-2 bg-gray-300 rounded-sm" />
            <div className="w-full h-9 bg-accent/15 border border-accent/30 rounded-md p-1 flex items-center justify-between px-2">
              <div className="w-1/2 h-2 bg-accent rounded-xs" />
              <div className="w-10 h-3 bg-accent rounded-xs" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white border border-gray-200 p-1 rounded-sm flex items-center gap-1">
                <div className="w-5 h-5 bg-gray-200 rounded-xs shrink-0" />
                <div className="w-full space-y-0.5">
                  <div className="w-3/4 h-1.5 bg-gray-700 rounded-xs" />
                  <div className="w-1/2 h-1 bg-gray-300 rounded-xs" />
                </div>
              </div>
              <div className="bg-white border border-gray-200 p-1 rounded-sm flex items-center gap-1">
                <div className="w-5 h-5 bg-gray-200 rounded-xs shrink-0" />
                <div className="w-full space-y-0.5">
                  <div className="w-3/4 h-1.5 bg-gray-700 rounded-xs" />
                  <div className="w-1/2 h-1 bg-gray-300 rounded-xs" />
                </div>
              </div>
            </div>
            <div className="w-full h-1.5 bg-gray-200 rounded-xs" />
          </div>
        );

      case 'inverted_pyramid':
        return (
          <div className="w-full h-32 bg-gray-50 border border-gray-200 rounded-lg p-3 flex flex-col items-center justify-between">
            {/* Wide Base at Top */}
            <div className="w-full h-10 bg-amber-100 border border-amber-300 rounded-md flex items-center justify-center text-[8px] font-extrabold text-amber-800">
              Broad Hero Visual (Wide Top)
            </div>
            {/* Tapering Copy (Middle) */}
            <div className="w-3/4 h-2 bg-gray-800 rounded-xs" />
            <div className="w-1/2 h-1.5 bg-gray-400 rounded-xs" />
            {/* Focused Vertex CTA */}
            <div className="w-28 h-4.5 bg-amber-600 text-white rounded-md flex items-center justify-center text-[8px] font-black shadow-xs">
              Single Focused CTA ▼
            </div>
            <div className="w-full h-1.5 bg-gray-200 rounded-xs" />
          </div>
        );

      case 'zig_zag':
        return (
          <div className="w-full h-32 bg-gray-50 border border-gray-200 rounded-lg p-2.5 flex flex-col justify-between">
            {/* Row 1: Left Image, Right Text */}
            <div className="flex items-center gap-2">
              <div className="w-12 h-9 bg-emerald-100 border border-emerald-300 rounded-xs shrink-0" />
              <div className="flex-1 space-y-1">
                <div className="w-4/5 h-2 bg-gray-700 rounded-xs" />
                <div className="w-full h-1 bg-gray-300 rounded-xs" />
                <div className="w-10 h-2 bg-emerald-600 rounded-xs" />
              </div>
            </div>
            {/* Row 2: Left Text, Right Image */}
            <div className="flex items-center gap-2">
              <div className="flex-1 space-y-1 text-right flex flex-col items-end">
                <div className="w-4/5 h-2 bg-gray-700 rounded-xs" />
                <div className="w-full h-1 bg-gray-300 rounded-xs" />
                <div className="w-10 h-2 bg-emerald-600 rounded-xs" />
              </div>
              <div className="w-12 h-9 bg-emerald-100 border border-emerald-300 rounded-xs shrink-0" />
            </div>
            <div className="w-full h-1.5 bg-gray-200 rounded-xs" />
          </div>
        );

      case 'f_pattern':
        return (
          <div className="w-full h-32 bg-gray-50 border border-gray-200 rounded-lg p-3 flex flex-col justify-between">
            {/* Top Bar of F */}
            <div className="w-full h-3 bg-gray-900 rounded-xs" />
            {/* Left scan spine + Middle bar of F */}
            <div className="flex gap-2">
              <div className="w-1.5 h-12 bg-red-500 rounded-xs shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="w-3/4 h-2 bg-gray-700 rounded-xs" />
                <div className="w-full h-1.5 bg-gray-300 rounded-xs" />
                <div className="w-2/3 h-1.5 bg-gray-300 rounded-xs" />
                <div className="w-16 h-3 bg-red-600 rounded-xs" />
              </div>
            </div>
            {/* Bottom visual */}
            <div className="w-full h-5 bg-gray-200 rounded-xs" />
          </div>
        );

      case 'dynamic_product_feed':
        return (
          <div className="w-full h-32 bg-gray-50 border border-gray-200 rounded-lg p-3 flex flex-col justify-between">
            <div className="flex justify-between items-center">
              <div className="w-14 h-2 bg-gray-700 rounded-xs" />
              <div className="w-10 h-2.5 bg-accent/30 rounded-xs" />
            </div>
            {/* 3-Column Product Grid */}
            <div className="grid grid-cols-3 gap-1.5 my-1">
              {[1, 2, 3].map((item) => (
                <div key={item} className="bg-white border border-gray-200 rounded-sm p-1 text-center space-y-1">
                  <div className="w-full h-6 bg-gray-200 rounded-xs" />
                  <div className="w-full h-1.5 bg-gray-700 rounded-xs" />
                  <div className="w-2/3 mx-auto h-1.5 bg-accent rounded-xs" />
                </div>
              ))}
            </div>
            <div className="w-full h-1.5 bg-gray-200 rounded-xs" />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-[#E4E4E7] w-full max-w-5xl shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-6 sm:p-8 bg-[#09090B] text-white flex items-start justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/20 text-accent text-xs font-extrabold uppercase tracking-wider mb-2">
              <Layout className="w-3.5 h-3.5" />
              <span>Email Template Studio (Link Mobility Standards)</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Select an Email Layout Architecture
            </h2>
            <p className="text-xs sm:text-sm text-gray-300 mt-1 max-w-2xl leading-relaxed">
              Choose from the 8 industry-standard structural templates. Each layout is engineered with responsive desktop/mobile breakpoints and automatic CAN-SPAM compliance footers.
            </p>
          </div>

          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Categories */}
        <div className="p-4 bg-[#FAFAFA] border-b border-[#E4E4E7] flex flex-wrap gap-2 items-center px-6 sm:px-8">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mr-2">Filter By:</span>
          {(['all', 'direct', 'promotional', 'newsletter', 'ecommerce'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                filterCategory === cat 
                  ? 'bg-[#09090B] text-white shadow-xs' 
                  : 'bg-white border border-[#E4E4E7] text-gray-600 hover:bg-gray-100'
              }`}
            >
              {cat === 'all' ? 'All 8 Structures' : cat}
            </button>
          ))}
        </div>

        {/* Template Grid (8 Templates) */}
        <div className="p-6 sm:p-8 max-h-[65vh] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {filteredTemplates.map((template) => {
              const isSelected = selectedTemplateId === template.id;

              return (
                <div 
                  key={template.id}
                  onClick={() => {
                    onSelectTemplate(template.id);
                    onClose();
                  }}
                  className={`rounded-2xl border-2 p-4 cursor-pointer transition-all flex flex-col justify-between hover:shadow-md group ${
                    isSelected 
                      ? 'border-accent bg-accent/5 ring-2 ring-accent/20' 
                      : 'border-[#E4E4E7] bg-white hover:border-gray-400'
                  }`}
                >
                  <div>
                    {/* Visual Wireframe Preview */}
                    <div className="mb-3 relative overflow-hidden rounded-lg group-hover:scale-[1.02] transition-transform">
                      {renderWireframe(template.id)}
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center shadow-md">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>

                    <h4 className="font-extrabold text-sm text-[#09090B] mb-0.5 group-hover:text-accent transition-colors">
                      {template.name}
                    </h4>
                    <p className="text-[11px] font-bold text-accent mb-2">
                      {template.tagline}
                    </p>
                    <p className="text-xs text-gray-500 leading-snug mb-3">
                      {template.purpose}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#E4E4E7]/60">
                    <span className="text-[10px] font-bold text-gray-400 block mb-2">
                      Best For: <strong className="text-gray-700 font-semibold">{template.bestFor}</strong>
                    </span>
                    <button 
                      className={`w-full py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                        isSelected 
                          ? 'bg-accent text-white shadow-xs' 
                          : 'bg-[#F4F4F5] text-charcoal group-hover:bg-[#09090B] group-hover:text-white'
                      }`}
                    >
                      <span>{isSelected ? 'Active Template' : 'Select Layout'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#FAFAFA] border-t border-[#E4E4E7] flex items-center justify-between px-6 sm:px-8 text-xs text-gray-500">
          <span>Standards Grounded in Link Mobility Design Framework</span>
          <button 
            onClick={onClose}
            className="px-5 py-2 bg-white border border-[#E4E4E7] hover:bg-gray-100 rounded-xl font-bold text-charcoal transition-colors"
          >
            Close Gallery
          </button>
        </div>

      </div>
    </div>
  );
};

export default TemplateGalleryModal;
