import React, { useState, useEffect } from "react";

import "./FormContainer.css";

export default function FormContainer(props) {
  const {
    fields,
    onSubmit,
    // isSubmitDisabled,
    isSubmitDisabled = false,
    errors,
    validations,
    className = "",
    inputClassName = "",
    submitLabel = "Submit",
    submitButtonClass = "",
    formTitle = "",
    extraElements,
    googleElement,
  } = props;

  const [validationErrors, setValidationErrors] = useState({});

  const validateCommonFields = (fields, validations) => {
    let errors = {};

    validations.forEach((validation) => {
      const field = fields.find((f) => f.name === validation.fieldName);
      const value = field ? field.value : null;

      // Check if the validation rule returns true or if the value is empty
      if (validation.rule(value)) {
        errors[validation.fieldName] = validation.message;
      }
    });

    return errors;
  };

  const clearValidationError = (fieldName) => {
    setValidationErrors((prevErrors) => {
      const newErrors = { ...prevErrors };
      delete newErrors[fieldName];
      return newErrors;
    });
  };

  //    Handler for input changes
  const handleInputChange = (setterFunction, fieldType) => (e) => {
    const { name, type } = e.target;
    let value;

    if (fieldType === "file" && e.target.files && e.target.files.length > 0) {
      value = e.target.files[0];
    } else {
      value = e.target.value;
    }

    setterFunction(value);
    clearValidationError(name);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    const errors = validateCommonFields(fields, validations);
    setValidationErrors(errors);
    if (Object.keys(errors).length === 0 && onSubmit) {
      onSubmit(e);
    } else {
      // console.log("Validation errors detected. Not proceeding."); // Logging
    }
  };

  const findErrorForField = (fieldName) => {
    if (Array.isArray(errors)) {
      return (
        errors.find((error) => error.toLowerCase().includes(fieldName)) ||
        validationErrors[fieldName]
      );
    }
    return validationErrors[fieldName];
  };

  const isButtonDisabled =
    isSubmitDisabled || Object.keys(validationErrors).length > 0;
  return (
    <form onSubmit={handleFormSubmit} className={`form-container ${className}`}>
      {formTitle && <h1>{formTitle}</h1>}
      {fields.map((field, index) => {
        const fieldError = findErrorForField(field.name);
        switch (field.type) {
          case "text":
          case "email":
          case "password":
          case "file":
            return (
              <div key={index}>
                <label>{field.label}</label>
                <input
                  type={field.type}
                  placeholder={field.placeholder}
                  value={field.value}
                  onChange={handleInputChange(field.setter, "file")}
                  className={inputClassName}
                />
                {fieldError && <div className="error">{fieldError}</div>}
              </div>
            );

          case "textarea":
            return (
              <div key={index}>
                <label>{field.label}</label>
                <textarea
                  value={field.value}
                  placeholder={field.placeholder}
                  onChange={handleInputChange(field.setter)}
                />
                {fieldError && <div className="error">{fieldError}</div>}
              </div>
            );
          case "select":
            return (
              <div key={index}>
                <select
                  value={field.value}
                  onChange={handleInputChange(field.setter)}
                >
                  {field.options.map((option, optIndex) => (
                    <option key={optIndex} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {fieldError && <div className="error">{fieldError}</div>}
              </div>
            );
          case "time":
            return (
              <div key={index}>
                <label>{field.label}</label>
                <input
                  type="time"
                  value={field.value}
                  placeholder={field.placeholder}
                  onChange={handleInputChange(field.setter)}
                  className={inputClassName}
                />
                {fieldError && <div className="error">{fieldError}</div>}
              </div>
            );
          default:
            return null;
        }
      })}
      <button
        disabled={isSubmitDisabled}
        // onClick={() => console.log("Button was clicked!")}
        type="submit"
        style={{ opacity: 1, cursor: "pointer" }}
      >
        {submitLabel}
      </button>
      {extraElements}
      {googleElement}
    </form>
  );
}
