// frontend/src/store/csrf.js
import Cookies from 'js-cookie';

// This function fetches the CSRF token from the server and sets it as a cookie.
export const restoreCSRF = () => async () => {
  await fetch("/api/auth/csrf/restore");
};

// This is a custom fetch function that appends the CSRF token to any non-GET request.
export const csrfFetch = async (url, options = {}) => {
  options.method = options.method || "GET";
  options.headers = options.headers || {};

  if (options.method.toUpperCase() !== "GET") {
    const csrfToken = Cookies.get("XSRF-TOKEN");
    if (csrfToken) {
      options.headers["X-CSRFToken"] = csrfToken;
    }
  }

  const res = await fetch(url, options);
  if (res.status >= 400) throw res;
  return res;
};


