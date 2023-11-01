import React, { useState } from "react";
import { InputComponent } from "./InputComponent";
import { TextareaComponent } from "./TextareaComponent";
import { SelectComponent } from "./SelectComponent";
import "./FormContainer.css";

export default function FormContainer(props) {
  const {
    fields,
    onSubmit,
    isSubmitDisabled,
    errors,
    validations,
    className = "",
    inputClassName = "",
    submitLabel = "Submit",
    submitButtonClass = "",
    formTitle = "",
  } = props;

  const [validationErrors, setValidationErrors] = useState({});

  const validateCommonFields = (fields, validations) => {
    let errors = {};

    validations.forEach((validation) => {
      const field = fields.find((f) => f.name === validation.fieldName);
      const value = field ? field.value : null;

      if (value && validation.rule(value)) {
        errors[validation.fieldName] = validation.message;
      }
    });

    return errors;
  };
  const clearValidationError = (fieldName) => {
    setValidationErrors(prevErrors => {
        const newErrors = { ...prevErrors };
        delete newErrors[fieldName];
        return newErrors;
    });
};

  // const handleInputChange = (setterFunction) => (e) => {
  //   setterFunction(e.target.value);
  // };
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
        className={submitButtonClass}
        type="submit"
        disabled={isButtonDisabled}
      >
        {submitLabel}
      </button>
    </form>
  );
}

// // The FormContainer component is a reusable form wrapper designed for use in various projects.
// // It simplifies form rendering, input handling, and validation for consistent and efficient form development.
// // This component is adaptable for different forms by providing an array of 'fields' with configurable properties.
// // The 'onSubmit' function allows you to specify the action to perform when the form is submitted.
// // Additionally, it supports custom validations and displays relevant error messages.
// import React, { useState } from "react";
// import { InputComponent } from "./InputComponent";
// import { TextareaComponent } from "./TextareaComponent";
// import { SelectComponent } from "./SelectComponent";
// import "./FormContainer.css";

// // Handler for input changes
// // const handleInputChange = (setterFunction, clearValidationError) => (e) => {
// //   const { name, type } = e.target;
// //   const value = type === "file" ? e.target.files[0] : e.target.value;

// //   // console.log(`Value for ${name}:`, value); // Debugging line

// //   setterFunction(value);
// //   clearValidationError(name);
// // };

// // Validates common form fields based on provided rules.
// export const validateCommonFields = (fields, validations) => {
//   const errors = {};

//   validations.forEach((validation) => {
//     const fieldObject = fields.find(f => f.name === validation.fieldName);
//     const fieldValue = fieldObject ? fieldObject.value : null;

//     // console.log(`Value for ${validation.fieldName} during validation:`, fieldValue); // Debugging line

//     if (fieldValue !== null) {
//       const error = validation.rule(fieldValue);
//       if (error) {
//         errors[validation.fieldName] = validation.message;
//       }
//     }
//   });

//   return errors;
// };

// export default function FormContainer(props) {
//   const {
//     fields, onSubmit, isSubmitDisabled, errors, validations,
//     className, inputClassName, submitLabel, submitButtonClass, formTitle
//   } = props;

//   const [validationErrors, setValidationErrors] = useState({});

//   // Clears a specific validation error for a field.
//   const clearValidationError = (fieldName) => {
//     setValidationErrors(prevErrors => {
//       const newErrors = { ...prevErrors };
//       delete newErrors[fieldName];
//       return newErrors;
//     });
//   };
//   // const imageRef = props.imageRef;

//   // Handles form submission.
//   const handleFormSubmit = (e) => {
//     e.preventDefault();
//     // const errors = validateCommonFields(fields, validations, imageRef);
//     const errors = validateCommonFields(fields, validations);
//     setValidationErrors(errors);

//     if (Object.keys(errors).length === 0 && onSubmit) {
//       onSubmit(e);
//     }
//   };

//   // Finds and returns an error message for a specific field.
//   const findErrorForField = (fieldName) => {
//     if (Array.isArray(errors)) {
//       return (
//         errors.find(error => error.toLowerCase().includes(fieldName)) ||
//         validationErrors[fieldName]
//       );
//     }
//     return validationErrors[fieldName];
//   };

//   const isButtonDisabled = isSubmitDisabled || Object.keys(validationErrors).length > 0;

//   return (
//     <form onSubmit={handleFormSubmit} className={`form-container ${className}`}>
//       {formTitle && <h1>{formTitle}</h1>}
//       {fields.map((field, index) => {
//         const ComponentMap = {
//           "text": InputComponent,
//           "email": InputComponent,
//           "password": InputComponent,
//           "file": InputComponent,
//           "textarea": TextareaComponent,
//           "select": SelectComponent
//         };

//         const Component = ComponentMap[field.type];
//         const fieldError = findErrorForField(field.name);

//         return (
//           <div key={index}>
//             {fieldError && <div className="error">{fieldError}</div>}
//             <Component
//               {...field}
//               error={validationErrors[field.name]}
//               onChange={handleInputChange(field.setter, clearValidationError)}
//               className={className}
//               inputClassName={inputClassName}
//             />
//           </div>
//         );
//       })}

//       <button
//         className={submitButtonClass}
//         type="submit"
//         disabled={isButtonDisabled}
//       >
//         {submitLabel}
//       </button>
//     </form>
//   );
// }

// import React, { useState } from "react";
// import { InputComponent } from "./InputComponent";
// import { TextareaComponent } from "./TextareaComponent";
// import { SelectComponent } from "./SelectComponent";
// import "./FormContainer.css";

// // A higher-order function that returns an event handler for input changes.

// const handleInputChange = (setterFunction, clearValidationError) => (e) => {
//   const { name, type } = e.target;
//   const value = type === "file" ? e.target.files[0] : e.target.value;

//   setterFunction(value);
//   clearValidationError(name);
// };

// // Validates common form fields based on provided rules.
// export const validateCommonFields = (fields, validations) => {
//   const errors = {};

//   validations.forEach((validation) => {
//     const fieldObject = fields.find(f => f.name === validation.fieldName);
//     const fieldValue = fieldObject ? fieldObject.value : null;

//     if (fieldValue !== null) {
//       const errorMessage = validation.rule(fieldValue);
//       if (errorMessage) {
//         errors[validation.fieldName] = errorMessage;
//       }
//     }
//   });

//   return errors;
// };

// // The FormContainer component is a reusable form wrapper that can render various form input components.
// export default function FormContainer({
//   fields,
//   onSubmit,
//   isSubmitDisabled = false,
//   errors,
//   validations = [],
//   className = "",
//   inputClassName,
//   submitLabel = "Submit",
//   submitButtonClass = "",
//   formTitle = "",
// }) {
//   console.log("Props received by FormContainer:", {
//     fields, onSubmit, isSubmitDisabled, errors, validations, className, inputClassName, submitLabel, submitButtonClass, formTitle
//   });

//   const [validationErrors, setValidationErrors] = useState({});

//   // Clears a specific validation error for a field.
//   const clearValidationError = (fieldName) => {
//     setValidationErrors((prevErrors) => {
//       const newErrors = { ...prevErrors };
//       delete newErrors[fieldName];
//       return newErrors;
//     });
//   };

//   // Handles form submission.
//   const handleFormSubmit = (e) => {
//     e.preventDefault();

//     const errors = validateCommonFields(fields, validations);
//     setValidationErrors(errors);

//     if (Object.keys(errors).length === 0 && onSubmit) {
//       onSubmit(e);
//     }
//   };

//   // Finds and returns an error message for a specific field.
//   const findErrorForField = (fieldName) => {
//     if (Array.isArray(errors)) {
//       return (
//         errors.find((error) => error.toLowerCase().includes(fieldName)) ||
//         validationErrors[fieldName]
//       );
//     }
//     return validationErrors[fieldName];
//   };
//   console.log("Validation errors:", validationErrors);

//   return (
//     <form onSubmit={handleFormSubmit} className={`form-container ${className}`}>
//       {formTitle && <h1>{formTitle}</h1>}
//       {fields.map((field, index) => {
//         // Use InputComponent for text, email, password, etc., and TextareaComponent for textarea
//         // const Component = ['text', 'email', 'password'].includes(field.type) ? InputComponent : TextareaComponent;
//         let Component = InputComponent; // Default
//         if (["text", "email", "password", "file"].includes(field.type)) {
//           Component = InputComponent;
//         } else if (field.type === "textarea") {
//           Component = TextareaComponent;
//         } else if (field.type === "select") {
//           Component = SelectComponent;
//         }

//         const fieldError = findErrorForField(field.name);
//         return (
//           <div key={index}>
//             {fieldError && <div className="error">{fieldError}</div>}{" "}
//             {/* Display the error */}
//             <Component
//               {...field}
//               error={validationErrors[field.name]}
//               onChange={handleInputChange(field.setter, clearValidationError)}
//               width={field.width}
//               className={className}
//               inputClassName={inputClassName}
//             />
//           </div>
//         );
//       })}

// <button
//         className={submitButtonClass}
//         type="submit"
//         disabled={isSubmitDisabled}
//         // disabled={false}
//       >
//         {submitLabel}
//       </button>
//     </form>
//   );
// }
