import { forwardRef } from 'preact/compat';

export const Search = forwardRef(({ value, onInput, onKeyDown }, ref) => {
  return (
    <div class="relative flex items-center w-full border-b border-border bg-secondary">
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
        class="flex-1 px-4 py-3 text-base bg-transparent text-foreground placeholder-muted-foreground outline-none"
      />
    </div>
  );
});
