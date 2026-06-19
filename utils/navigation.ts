import { Router } from 'expo-router';

/** Navigate back when possible; otherwise return to the main tabs. */
export function goBackOrHome(router: Router) {
  if (router.canGoBack()) {
    router.back();
    return;
  }

  router.replace('/(tabs)');
}
