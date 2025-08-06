'use client';

import React from 'react';

interface ClientWrapperProps {
  children: React.ReactNode;
}

export const ClientWrapper: React.FC<ClientWrapperProps> = ({ children }) => {
  return <div className="client-wrapper">{children}</div>;
};

export default ClientWrapper; 