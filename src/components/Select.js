// basic select

const Select = ({ name, selectedValue, options, updateValue }) => (
  <select name={name} onChange={(e) => updateValue(e.target.value)}>
    {options.map((o, i) => (<option value={o} selected={o === selectedValue || (i === 0 && o === null)}>{o}</option>))}
  </select>
);

export default Select;