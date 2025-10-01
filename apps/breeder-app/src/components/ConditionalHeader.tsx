'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Header from './Header';

export const ConditionalHeader: React.FC = () => {
  const pathname = usePathname();
  
  // Hide header on auth pages
  const hideHeader = pathname?.startsWith('/auth/');
  
  if (hideHeader) {
    return null;
  }
  
  return <Header />;
};

export default ConditionalHeader;

