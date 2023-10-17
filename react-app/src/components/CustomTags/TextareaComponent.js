export default function TextareaComponent({ label, value, error, width = 'full', ...restProps }) {
  return (
    <div className={`textarea-wrapper ${width}`}>
      <label>{label}</label>
      <textarea value={value} {...restProps}></textarea>
      {error && <div className="error">{error}</div>}
    </div>
  );
}
