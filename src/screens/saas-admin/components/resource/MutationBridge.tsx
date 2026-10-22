import { useEffect, useRef } from "react";
import type { ResourceMutationHook } from "./types";

type Trigger = (body?: unknown) => Promise<unknown>;

/**
 * Calls a mutation hook unconditionally so React hook order stays stable, then
 * hands the resulting trigger up to the parent through a ref callback. Used by
 * screens whose create/update/quick-action mutation is only defined for some
 * configs (so the hook cannot be called conditionally in the parent).
 *
 * The exposed trigger calls `.unwrap()`, so HTTP failures reject (letting
 * callers surface the error) and the resolved value is the parsed response body.
 */
export function MutationBridge({
  hook,
  onReady,
}: {
  hook: ResourceMutationHook;
  onReady: (trigger: Trigger | null) => void;
}) {
  const [rawTrigger] = hook();
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;
  useEffect(() => {
    if (typeof rawTrigger !== "function") {
      onReadyRef.current(null);
      return;
    }
    const trigger: Trigger = (body?: unknown) =>
      (
        rawTrigger as unknown as (b?: unknown) => {
          unwrap: () => Promise<unknown>;
        }
      )(body).unwrap();
    onReadyRef.current(trigger);
    return () => onReadyRef.current(null);
  }, [rawTrigger]);
  return null;
}
