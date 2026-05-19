export function getToken(): string | undefined {
  return document.cookie.match(/token=([^;]+)/)?.[1];
}