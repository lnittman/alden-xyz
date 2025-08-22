/**
 * Normalizes runtime context to ensure consistent access
 * Returns an object with a get method that works for both RuntimeContext instances and plain objects
 */
export function normalizeRuntimeContext(runtimeContext: any): {
  get: (key: string) => any;
} {
  if (!runtimeContext) {
    return { get: () => undefined };
  }

  // If it already has a get method, return as-is
  if (typeof runtimeContext.get === 'function') {
    return runtimeContext;
  }

  // Create a wrapper with get method for plain objects
  return {
    get: (key: string) => runtimeContext[key],
  };
}

/**
 * Helper to access runtime context values that works with both
 * RuntimeContext instances (with get method) and plain objects
 */
export function getRuntimeContextValue<K extends string>(
  runtimeContext: any,
  key: K
): any {
  if (!runtimeContext) {
    return undefined;
  }

  // Try get method first (RuntimeContext instance)
  if (typeof runtimeContext.get === 'function') {
    return runtimeContext.get(key);
  }

  // Fall back to direct property access (plain object)
  return runtimeContext[key];
}

/**
 * Creates a runtime context object from a plain object
 */
export function createRuntimeContext(context: Record<string, any>) {
  return normalizeRuntimeContext(context);
}
