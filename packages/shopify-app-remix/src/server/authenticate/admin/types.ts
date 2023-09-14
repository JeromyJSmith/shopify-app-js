import {JwtPayload, Session, ShopifyRestResources} from '@shopify/shopify-api';

import {EnsureCORSFunction} from '../helpers/ensure-cors-headers';
import type {AdminApiContext, AppConfigArg} from '../../config-types';

import type {BillingContext} from './billing/types';
import {RedirectFunction} from './helpers/redirect';

interface AdminContextInternal<
  Config extends AppConfigArg,
  Resources extends ShopifyRestResources = ShopifyRestResources,
> {
  /**
   * The session for the user who made the request.
   *
   * This comes from the session storage which `shopifyApp` uses to store sessions in your database of choice.
   *
   * Use this to get shop or user-specific data.
   *
   * @example
   * <caption>Getting your app's shop-specific widget data using an offline session</caption>
   * ```ts
   * // shopify.server.ts
   * import { shopifyApp } from "@shopify/shopify-app-remix/server";
   *
   * const shopify = shopifyApp({
   *   // ...etc
   * });
   * export default shopify;
   * export const authenticate = shopify.authenticate;
   * ```
   * ```ts
   * // /app/routes/**\/*.ts
   * import { LoaderArgs, json } from "@remix-run/node";
   * import { authenticate } from "../shopify.server";
   * import { getWidgets } from "~/db/widgets.server";
   *
   * export const loader = async ({ request }: LoaderArgs) => {
   *   const { session } = await authenticate.admin(request);
   *   return json(await getWidgets({shop: session.shop));
   * };
   * ```
   *
   * @example
   * <caption>Getting your app's user-specific widget data using an online session</caption>
   * ```ts
   * // shopify.server.ts
   * import { shopifyApp } from "@shopify/shopify-app-remix/server";
   *
   * const shopify = shopifyApp({
   *   // ...etc
   *   useOnlineTokens: true,
   * });
   * export default shopify;
   * export const authenticate = shopify.authenticate;
   * ```
   * ```ts
   * // /app/routes/**\/*.ts
   * import { LoaderArgs, json } from "@remix-run/node";
   * import { authenticate } from "../shopify.server";
   * import { getWidgets } from "~/db/widgets.server";
   *
   * export const loader = async ({ request }: LoaderArgs) => {
   *   const { session } = await authenticate.admin(request);
   *   return json(await getWidgets({user: session.onlineAccessInfo!.id}));
   * };
   * ```
   */
  session: Session;

  /**
   * Methods for interacting with the Shopify GraphQL / REST Admin APIs for the store that made the request
   */
  admin: AdminApiContext<Resources>;

  /**
   * Billing methods for this store, based on the plans defined in the `billing` config option.
   *
   * {@link https://shopify.dev/docs/apps/billing}
   */
  billing: BillingContext<Config>;

  /**
   * A function that ensures the CORS headers are set correctly for the response
   *
   * @example
   * <caption>Setting CORS headers for a admin request</caption>
   * ```ts
   * // /app/routes/admin/widgets.ts
   * import { LoaderArgs, json } from "@remix-run/node";
   * import { authenticate } from "../shopify.server";
   * import { getWidgets } from "~/db/widgets.server";
   *
   * export const loader = async ({ request }: LoaderArgs) => {
   *   const { session, cors } = await authenticate.admin(request);
   *   return cors(json(await getWidgets({user: session.onlineAccessInfo!.id})));
   * };
   * ```
   */
  cors: EnsureCORSFunction;
}

export interface EmbeddedAdminContext<
  Config extends AppConfigArg,
  Resources extends ShopifyRestResources = ShopifyRestResources,
> extends AdminContextInternal<Config, Resources> {
  /**
   * The decoded and validated session token for the request.
   *
   * Returned only if `isEmbeddedApp` is `true`.
   *
   * {@link https://shopify.dev/docs/apps/auth/oauth/session-tokens#payload}
   *
   * @example
   * <caption>Getting your app's user-specific widget data using the session token</caption>
   * ```ts
   * // shopify.server.ts
   * import { shopifyApp } from "@shopify/shopify-app-remix/server";
   *
   * const shopify = shopifyApp({
   *   // ...etc
   *   useOnlineTokens: true,
   * });
   * export default shopify;
   * export const authenticate = shopify.authenticate;
   * ```
   * ```ts
   * // /app/routes/**\/*.ts
   * import { LoaderArgs, json } from "@remix-run/node";
   * import { authenticate } from "../shopify.server";
   * import { getWidgets } from "~/db/widgets.server";
   *
   * export const loader = async ({ request }: LoaderArgs) => {
   *   const { sessionToken } = await authenticate.public(
   *     request
   *   );
   *   return json(await getWidgets({user: sessionToken.sub}));
   * };
   * ```
   */
  sessionToken: JwtPayload;

  /**
   * A function that redirects the user to a new page, ensuring that the appropriate parameters are set for embedded
   * apps.
   *
   * Returned only if `isEmbeddedApp` is `true`.
   *
   * @example
   * <caption>Redirecting the user to the app's homepage</caption>
   * ```ts
   * // /app/routes/admin/widgets.ts
   * import { LoaderArgs, json } from "@remix-run/node";
   * import { authenticate } from "../shopify.server";
   *
   * export const loader = async ({ request }: LoaderArgs) => {
   *   const { session, redirect } = await authenticate.admin(request);
   *   return redirect("/");
   * };
   * ```
   *
   * @example
   * <caption>Redirecting outside of Shopify Admin</caption>
   * ```ts
   * // /app/routes/admin/widgets.ts
   * import { LoaderArgs, json } from "@remix-run/node";
   * import { authenticate } from "../shopify.server";
   *
   * export const loader = async ({ request }: LoaderArgs) => {
   *   const { session, redirect } = await authenticate.admin(request);
   *   return redirect("/", { target: '_parent' });
   * };
   * ```
   */
  redirect: RedirectFunction;
}
export interface NonEmbeddedAdminContext<
  Config extends AppConfigArg,
  Resources extends ShopifyRestResources = ShopifyRestResources,
> extends AdminContextInternal<Config, Resources> {}

export type AdminContext<
  Config extends AppConfigArg,
  Resources extends ShopifyRestResources = ShopifyRestResources,
> = Config['isEmbeddedApp'] extends false
  ? NonEmbeddedAdminContext<Config, Resources>
  : EmbeddedAdminContext<Config, Resources>;