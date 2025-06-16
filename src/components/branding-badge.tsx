
"use client";

import React from 'react';

const BrandingBadge: React.FC = () => {
  return (
    <div
      className="fixed bottom-4 right-4 z-50 px-3 py-1.5 rounded-lg shadow-md
                 bg-card/60 backdrop-blur-sm border border-border/50
                 text-xs text-foreground/80 select-none"
      aria-label="Created by SolSa Labs"
    >
      created by SolSa Labs
    </div>
  );
};

export default BrandingBadge;
