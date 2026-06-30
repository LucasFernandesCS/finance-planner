const ACCESS_TOKEN_KEY = "accessToken";

export function getAccessToken(): string | null {
  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setAccessToken(token: string): void {
  window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
  window.dispatchEvent(new Event("auth-token-change"));
}

export function clearAccessToken(): void {
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.dispatchEvent(new Event("auth-token-change"));
}

export function hasAccessToken(): boolean {
  return Boolean(getAccessToken());
}
