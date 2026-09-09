/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string = string> extends Record<string, unknown> {
<<<<<<< HEAD
      StaticRoutes: `/` | `/(onboarding)/language` | `/(onboarding)/login` | `/(tabs)` | `/(tabs)/alerts` | `/(tabs)/awareness` | `/(tabs)/home` | `/(tabs)/map` | `/(tabs)/profile` | `/(tabs)/sync` | `/_sitemap` | `/alerts` | `/awareness` | `/health-report` | `/health-report/select-source` | `/home` | `/language` | `/login` | `/map` | `/profile` | `/splash` | `/sync` | `/water-test`;
=======
      StaticRoutes: `/` | `/(onboarding)/language` | `/(onboarding)/login` | `/(tabs)` | `/(tabs)/alerts` | `/(tabs)/home` | `/(tabs)/map` | `/(tabs)/profile` | `/(tabs)/sync` | `/_sitemap` | `/alerts` | `/health-report` | `/health-report/select-source` | `/home` | `/language` | `/login` | `/map` | `/profile` | `/splash` | `/sync`;
>>>>>>> 559c10258b8859c7ff71cb71d7ac8eb51d12222f
      DynamicRoutes: `/(tabs)/alerts/${Router.SingleRoutePart<T>}` | `/alerts/${Router.SingleRoutePart<T>}`;
      DynamicRouteTemplate: `/(tabs)/alerts/[alertId]` | `/alerts/[alertId]`;
    }
  }
}
