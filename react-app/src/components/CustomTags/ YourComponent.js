import React, { useState } from 'react';
import FormContainer, { validateCommonFields } from './FormContainer';

// YourComponent is a demonstration component that illustrates how to use the custom FormContainer component.
// It manages form state with useState hooks and defines input fields for 'First Name', 'Last Name', 'Description', and 'City'.
// The FormContainer component is utilized to render these fields with custom configurations and validation rules.
//
// Example usage:
// <YourComponent />
function YourComponent() {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [description, setDescription] = useState('');
    const [city, setCity] = useState('');

    // Define an array of fields, each specifying type, name, label, setter function, initial value, width, and custom class names.
    const fields = [
        {
            type: 'text',
            name: 'firstName',
            label: 'First Name',
            setter: setFirstName,
            value: firstName,
            width: 'half',
            className: '',
            inputClassName: 'form-input'
        },
        {
            type: 'text',
            name: 'lastName',
            label: 'Last Name',
            setter: setLastName,
            value: lastName,
            width: 'half',
            className: '',
            inputClassName: 'form-input'
        },
        {
            type: 'textarea',
            name: 'description',
            label: 'Description',
            setter: setDescription,
            value: description,
            className: '',
            textareaClassName: 'form-textarea'
        },
        {
            type: 'select',
            name: 'city',
            setter: setCity,
            value: city,
            className: '',
            selectClassName: 'form-select',
            options: [
                { value: '', label: 'Select a City', disabled: true, selected: true },
                { value: 'Gotham', label: 'Gotham' }
            ],
        }
    ];

    // Define validation rules for form fields using an array of objects.
    const validations = [
        {
            fieldName: 'firstName',
            rule: (value) => !value,
            message: 'First Name is required',
        },
        {
            fieldName: 'lastName',
            rule: (value) => !value,
            message: 'Last Name is required',
        },
        {
            fieldName: 'city',
            rule: (value) => !value,
            message: 'City is required',
        },
    ];

    // Handle form submission by validating the fields and displaying errors if any.
    const handleSubmit = async () => {
        const errors = validateCommonFields(fields, validations);
        if (Object.keys(errors).length > 0) {
            console.error('Validation errors:', errors);
            return;
        }
        // Perform further submission logic if validation succeeds.
    };

    return (
        <div>
            {/* Render the form fields using the FormContainer component */}
            <FormContainer fields={fields} validations={validations} />
            <button onClick={handleSubmit}>Submit</button>
        </div>
    );
}

export default YourComponent;

