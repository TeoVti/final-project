export function AllJobs({ options, value, filterSetter, name = '' }) {
  return (
    <select
      value={value}
      onChange={(e) => {
        filterSetter(e.target.value);
      }}
    >
      <option value={''}>none</option>;
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
