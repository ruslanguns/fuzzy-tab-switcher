import { forwardRef } from "preact/compat";
import { useSignal } from "@preact/signals";
import { useEffect } from "preact/hooks";

const PLACEHOLDERS = [
  "Search open tabs...",
  "Find by title...",
  "Type to filter...",
  "Jump to tab...",
];

export const Search = forwardRef(({ value, onInput, onKeyDown }, ref) => {
  const placeholder = useSignal("");
  const phraseIndex = useSignal(0);
  const charIndex = useSignal(0);
  const isDeleting = useSignal(false);

  useEffect(() => {
    let timeout;

    const type = () => {
      const currentPhrase = PLACEHOLDERS[phraseIndex.value];

      if (isDeleting.value) {
        placeholder.value = currentPhrase.substring(0, charIndex.value - 1);
        charIndex.value--;
      } else {
        placeholder.value = currentPhrase.substring(0, charIndex.value + 1);
        charIndex.value++;
      }

      let typeSpeed = isDeleting.value ? 40 : 80;

      if (!isDeleting.value && charIndex.value === currentPhrase.length) {
        typeSpeed = 2000;
        isDeleting.value = true;
      } else if (isDeleting.value && charIndex.value === 0) {
        isDeleting.value = false;
        phraseIndex.value = (phraseIndex.value + 1) % PLACEHOLDERS.length;
        typeSpeed = 200;
      }

      timeout = setTimeout(type, typeSpeed);
    };

    const initialTimeout = setTimeout(type, 500);
    return () => {
      clearTimeout(timeout);
      clearTimeout(initialTimeout);
    };
  }, []);

  return (
    <div class="relative flex w-full items-center border-b border-border bg-secondary/50 transition-colors duration-200 focus-within:border-ring/30 focus-within:bg-background">
      <div class="pointer-events-none absolute left-3 flex items-center justify-center text-muted-foreground transition-colors duration-200 peer-focus-within:text-primary">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      </div>
      <input
        ref={ref}
        type="text"
        value={value}
        onInput={onInput}
        onKeyDown={onKeyDown}
        autoFocus
        placeholder={placeholder.value}
        autoComplete="off"
        spellCheck="false"
        class="peer flex-1 bg-transparent py-2.5 pr-4 pl-10 text-sm text-foreground outline-none placeholder:text-muted-foreground/70"
      />
    </div>
  );
});
