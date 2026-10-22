import { useEffect } from "react";

/**
 * Prompts the browser's native "leave site?" confirmation when `dirty` is true
 * and the user tries to unload the page (reload, close, external navigation).
 */
export function useUnsavedChanges(
  dirty: boolean,
  message = "You have unsaved changes. Are you sure you want to leave?",
): void {
  useEffect(() => {
    if (!dirty) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = message;
      return message;
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty, message]);
}
