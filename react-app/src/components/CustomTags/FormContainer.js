import React, { useState } from 'react';
import InputComponent from './InputComponent';
import TextareaComponent from './TextareaComponent';
import SelectComponent from './SelectComponent';  // If this isn't used, consider removing it
import './FormContainer.css';

const handleInputChange = (setterFunction, clearValidationError) => (e) => {
  const field = e.target.name;
  setterFunction(e.target.value);
  clearValidationError(field);
};

export const validateCommonFields = (fields, validations) => {
  const errors = {};

  validations.forEach(validation => {
    const fieldValue = fields.find(f => f.name === validation.fieldName).value;
    const errorMessage = validation.rule(fieldValue);
    if (errorMessage) {
      errors[validation.fieldName] = errorMessage;
    }
  });

  return errors;
};

export default function FormContainer({ fields, onSubmit, isSubmitDisabled = false, errors, validations=[], className = '', inputClassName, submitLabel = 'Submit', submitButtonClass = '', formTitle = '' }) {
  const [validationErrors, setValidationErrors] = useState({});

  const clearValidationError = (fieldName) => {
    setValidationErrors((prevErrors) => {
      const newErrors = { ...prevErrors };
      delete newErrors[fieldName];
      return newErrors;
    });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    const errors = validateCommonFields(fields, validations);
    setValidationErrors(errors);

    if(Object.keys(errors).length === 0 && onSubmit) {
      onSubmit(e);
    }
  };

  const findErrorForField = (fieldName) => {
    return errors.find(error => error.toLowerCase().includes(fieldName)) || validationErrors[fieldName];
  }

  return (
    <form onSubmit={handleFormSubmit} className={`form-container ${className}`}>
      {formTitle && <h1>{formTitle}</h1>}
      {fields.map((field, index) => {
        // Use InputComponent for text, email, password, etc., and TextareaComponent for textarea
        const Component = ['text', 'email', 'password'].includes(field.type) ? InputComponent : TextareaComponent;
        const fieldError = findErrorForField(field.name); // Fetch the error for this field
        return (
          <div key={index}>
            {fieldError && <div className="error">{fieldError}</div>} {/* Display the error */}
            <Component
              {...field}
              error={validationErrors[field.name]}
              onChange={handleInputChange(field.setter, clearValidationError)}
              width={field.width}
              className={className}
              inputClassName={inputClassName}
            />
          </div>
        );
      })}
      <button className={submitButtonClass} type="submit" disabled={isSubmitDisabled}>
        {submitLabel}
      </button>
    </form>
  );
}
