import React, { createContext, useState } from 'react';

export const ContributionIndexContext = createContext();

export const ContributionIndexProvider = ({ children }) => {
  const [contributionIndex, setContributionIndex] = useState(null);

  return (
    <ContributionIndexContext.Provider value={{ contributionIndex, setContributionIndex }}>
      {children}
    </ContributionIndexContext.Provider>
  );
};