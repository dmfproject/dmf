/** Where the 500 page sends the visitor back to ("Try again"). */
export const RETURN_KEY = 'dmf-return-to';

/** Go to the 500 page, remembering the current page for "Try again". */
export function goToServerError(router: { replace: (href: string) => void }) {
  try {
    window.sessionStorage.setItem(RETURN_KEY, window.location.pathname + window.location.search);
  } catch {
    /* storage blocked: "Try again" goes home */
  }
  router.replace('/500/');
}
