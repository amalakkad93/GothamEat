import "./FormContainer.css";
export default function InputComponent({
  value,
  error,
  width = "full",
  className = "",
  inputClassName = "",
  ...restProps
}) {
  return (
    <div className={`input-wrapper ${width} ${className}`}>
      <input
        value={value}
        className={`${inputClassName} ${error ? "error-border" : ""}`}
        placeholder={`Enter ${restProps.label}`}
        {...restProps}
      />
      {error && <div className="error">{error}</div>}
    </div>
  );
}
