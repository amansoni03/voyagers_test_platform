import React from 'react';

interface SmsLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'responsive';
  variant?: 'full' | 'compact' | 'icon';
  showText?: boolean;
}

export const SmsLogo: React.FC<SmsLogoProps> = ({
  className = '',
  size = 'md',
}) => {
  const sizeClassMap: Record<string, string> = {
    sm: 'h-8 sm:h-9 w-auto',
    md: 'h-11 sm:h-12 w-auto',
    lg: 'h-16 sm:h-20 w-auto',
    xl: 'h-24 sm:h-28 w-auto',
    responsive: 'w-full h-auto max-w-[480px]',
  };

  const heightClass = sizeClassMap[size] || 'h-12 w-auto';

  return (
    <div className={`inline-flex items-center shrink-0 select-none ${className}`}>
      <img
        src="/sms-logo.png"
        alt="School of Management Sciences Lucknow — Accredited with A+ Grade by NAAC"
        className={`${heightClass} object-contain`}
        draggable={false}
      />
    </div>
  );
};
