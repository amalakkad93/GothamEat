import React from 'react';
import './Stepper.css'; 

const Stepper = ({ steps, currentStep }) => {
  return (
    <div className="stepper-container">
      {steps.map((step, index) => (
        <div key={step} className={`step ${index <= currentStep ? 'completed' : ''}`}>
          <div className="step-number">{index <= currentStep ? '✔️' : index + 1}</div>
          <div className="step-label">{step}</div>
        </div>
      ))}
    </div>
  );
};

export default Stepper;
