// A simple in-memory cache to speed up page navigations.
// Data is not persisted across page reloads.

const cache = new Map<string, any>();

export const setCache = (key: string, value: any, ttl?: number) => {
  cache.set(key, value);
  if (ttl) {
    setTimeout(() => {
      cache.delete(key);
    }, ttl);
  }
};

export const getCache = <T>(key: string): T | undefined => {
  return cache.get(key) as T | undefined;
};

export const deleteCache = (key: string) => {
  cache.delete(key);
};

export const clearCache = () => {
  cache.clear();
};
