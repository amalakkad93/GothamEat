import React, { useState } from 'react';
import FormContainer, {validateCommonFields} from './FormContainer';

function YourComponent() {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [description, setDescription] = useState('');
    const [city, setCity] = useState('');

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

    const handleSubmit = async () => {
        const errors = validateCommonFields(fields);
        if (Object.keys(errors).length > 0) {
            console.error('Validation errors:', errors);
            return;
        }
    };

    return (
        <div>
            <FormContainer fields={fields} validations={validations} />
            <button onClick={handleSubmit}>Submit</button>
        </div>
    );
}

export default YourComponent;
