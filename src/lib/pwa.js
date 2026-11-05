import { registerSW } from 'virtual:pwa-register';
import { toast } from './library';

// Service worker: cache para uso offline e atualização automática a cada deploy.
export function setupPWA() {
  if (!('serviceWorker' in navigator)) return;
  registerSW({
    immediate: true,
    onOfflineReady: () => toast('Pronto para usar offline'),
  });
}
