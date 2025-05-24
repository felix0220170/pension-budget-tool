import React, { useState } from 'react';
import Step1 from '../components/Step1';
import Step2 from '../components/Step2';
import Step3 from '../components/Step3';
import ProgressTracker from '../components/ProgressTracker';
import { ContributionIndexProvider } from '../ContributionIndexContext';

const CalculatorPage = () => {
  const [currentStep, setCurrentStep] = useState(0);

  const nextStep = () => {
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  };

  return (
    <ContributionIndexProvider>
      <div style={{margin: '20px'}}>
        <ProgressTracker currentStep={currentStep} />
        {currentStep === 0 && <Step1 onNext={nextStep} />}
        {currentStep === 1 && <Step2 onPrev={prevStep} onNext={nextStep} />}
        {currentStep === 2 && <Step3 onPrev={prevStep} />}
      </div>
    </ContributionIndexProvider>
  );
};

export default CalculatorPage;