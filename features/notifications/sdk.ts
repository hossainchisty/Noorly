import Constants, { ExecutionEnvironment } from 'expo-constants';
import type * as NotificationsTypes from 'expo-notifications';

export type NotificationsModule = typeof NotificationsTypes;
export type NotificationResponse = NotificationsTypes.NotificationResponse;

let cachedModule: NotificationsModule | null | undefined;
let handlerSet = false;

/**
 * Lazily loads expo-notifications. Expo Go (SDK 53+) removed Android
 * notifications, and the module throws (and logs) at import time there, so we
 * never load it in Expo Go and report "unsupported" instead. Use this wrapper
 * instead of importing expo-notifications directly.
 */
export function getNotifications(): NotificationsModule | null {
  if (Constants.executionEnvironment === ExecutionEnvironment.StoreClient) {
    cachedModule = null;
    return null;
  }
  if (cachedModule !== undefined) return cachedModule;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const module = require('expo-notifications') as NotificationsModule;
    if (!handlerSet) {
      handlerSet = true;
      module.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowBanner: true,
          shouldShowList: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        }),
      });
    }
    cachedModule = module;
  } catch {
    cachedModule = null;
  }
  return cachedModule;
}

export function isNotificationsSupported(): boolean {
  return getNotifications() !== null;
}
