import React from 'react';

function SelectComponent({ options, onChange, ...props }) {
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

export default SelectComponent;
