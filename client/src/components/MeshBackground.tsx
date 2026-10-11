import React from 'react';

interface MeshBackgroundProps {
  variant?: 'landing' | 'platform';
  className?: string;
}

export const MeshBackground: React.FC<MeshBackgroundProps> = ({ variant = 'landing', className = '' }) => {
  const isLanding = variant === 'landing';

  return (
    <div 
      className={`fixed inset-0 pointer-events-none overflow-hidden -z-10 select-none ${className}`}
      aria-hidden="true"
      style={{
        backgroundColor: '#FAF8F5'
      }}
    >
      {/* Subtle Editorial Terracotta & Espresso Warmth for Landing */}
      {isLanding && (
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(circle at 82% 14%, rgba(200, 90, 50, 0.08) 0%, transparent 45%), radial-gradient(circle at 12% 68%, rgba(25, 23, 22, 0.035) 0%, transparent 50%)',
          }}
        />
      )}

      {/* Crisp architectural Warm Stone 1px dot matrix */}
      <div 
        className="absolute inset-0 opacity-[0.42]"
        style={{
          backgroundImage: 'radial-gradient(#D6CFC2 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />
    </div>
  );
};

export default MeshBackground;
