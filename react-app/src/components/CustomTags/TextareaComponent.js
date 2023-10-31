// TextareaComponent is a reusable component for rendering text areas.
// It includes support for labels, values, errors, and width customization.
// The 'label' prop specifies the label text, 'value' sets the text area content,
// and 'error' displays an error message when provided.
// 'width' controls the width of the text area, and additional standard HTML props can be passed.
//
// Example usage:
// <TextareaComponent
//   label="Your Label"
//   value={textAreaValue}
//   error={textAreaError}
//   width="full"
//   onChange={handleTextareaChange}
// />

export function TextareaComponent({ label, value, error, width = 'full', ...restProps }) {
  return (
    <div className={`textarea-wrapper ${width}`}>
      <label>{label}</label>
      <textarea value={value} {...restProps}></textarea>
      {error && <div className="error">{error}</div>}
    </div>
  );
}
