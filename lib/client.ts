export async function jsonFetch<T>(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    credentials: "include",
  });

  const text = await res.text();
  let data: T & { error?: string };

  if (!text.trim()) {
    if (!res.ok) {
      throw new Error(`Request failed (${res.status})`);
    }
    return {} as T;
  }

  try {
    data = JSON.parse(text) as T & { error?: string };
  } catch {
    throw new Error(
      res.ok
        ? "Invalid response from server"
        : `Request failed (${res.status}). The server may be unavailable.`,
    );
  }

  if (!res.ok) {
    throw new Error(data.error ?? `Request failed (${res.status})`);
  }
  return data;
}
