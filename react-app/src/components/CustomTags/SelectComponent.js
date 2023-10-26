// SelectComponent is a versatile component for rendering select dropdowns.
// It accepts 'options' as an array of objects, 'onChange' for handling selection changes, and other standard HTML props.
// The component maps the provided 'options' to <option> elements.
//
// Example usage:
// <SelectComponent
//   options={[
//     { label: "Option 1", value: "option1" },
//     { label: "Option 2", value: "option2" },
//   ]}
//   onChange={handleSelectChange}
// />

import React from 'react';

export default function SelectComponent({ options, onChange, ...props }) {
    return (
        <select onChange={onChange} {...props}>
            {options.map((option, index) => (
                <option key={index} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
    );
}

