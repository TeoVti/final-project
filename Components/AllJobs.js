export function AllJobs({ options, value, filterSetter, placeholder = '' }) {
  return (
    <select
      className={placeholder}
      value={value}
      onChange={(e) => {
        filterSetter(e.target.value);
      }}
    >
      <option value={''}>{placeholder}</option>;
      {options.map((option) => {
        return (
          <option key={option.id} value={option.title}>
            {option.title}
          </option>
        );
      })}
    </select>
  );
}
