export function handleUnauthorized(error) {
  if (error?.response?.status !== 401) {
    return false;
  }

  if (!window.__ccmsAuthExpiredAlertShown) {
    window.__ccmsAuthExpiredAlertShown = true;
    alert("Session expired. Please login again.");
  }

  localStorage.clear();
  window.location.href = "/login";
  return true;
}
