const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

export const apiFetch = async <T = unknown>(
  endPoint: string,
  options: RequestInit = {},
): Promise<T> => {
  const headers = new Headers(options.headers);

  //Only usse JSON header when body is not FormData
  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE_URL}${endPoint}`, {
    ...options,
    credentials: "include",
    headers,

    // headers: {
    //   "Content-Type": "application/json",
    //   ...(options.headers || {}),
    // },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || "Something Went Wrong");
  }

  return data as T;
};
