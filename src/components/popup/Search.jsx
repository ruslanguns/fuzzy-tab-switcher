import { forwardRef } from 'preact/compat';

export const Search = forwardRef(({ value, onInput, onKeyDown }, ref) => {
  return (
    <input
      ref={ref}
      type="text"
      value={value}
      onInput={onInput}
      onKeyDown={onKeyDown}
      autoFocus
      placeholder="Search tabs..."
      autoComplete="off"
      spellCheck="false"
      class="w-full px-4 py-3 text-base border-b border-[#3e3e3e] bg-[#252526] text-[#d4d4d4] placeholder-[#858585] outline-none focus:ring-0"
    />
  );
});
