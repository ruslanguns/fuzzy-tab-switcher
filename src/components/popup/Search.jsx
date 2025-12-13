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
      class="w-full px-4 py-3 text-base border-b border-border bg-secondary text-foreground placeholder-muted-foreground outline-none focus:ring-0"
    />
  );
});
