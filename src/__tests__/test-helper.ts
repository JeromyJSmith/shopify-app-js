import * as jose from 'jose';

import {shopifyApi} from '..';
import {ConfigParams, LATEST_API_VERSION, Shopify} from '../base-types';
import {MemorySessionStorage} from '../session-storage/memory';
import {JwtPayload} from '../session/types';
import {getHMACKey} from '../utils/get-hmac-key';
import {mockTestRequests} from '../adapters/mock/mock_test_requests';
import {
  canonicalizeHeaders,
  Cookies,
  NormalizedRequest,
  NormalizedResponse,
} from '../runtime/http';
import {Session} from '../session/session';
import {RequestReturn} from '../clients/http_client/types';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Matchers<R> {
      toBeWithinSecondsOf(compareDate: number, seconds: number): R;
      toMatchMadeHttpRequest(): R;
    }
  }
}

// eslint-disable-next-line import/no-mutable-exports
let shopify: Shopify;
// eslint-disable-next-line import/no-mutable-exports
let testConfig: ConfigParams;

export function getNewTestConfig(): ConfigParams {
  return {
    apiKey: 'test_key',
    apiSecretKey: 'test_secret_key',
    scopes: ['test_scope'],
    hostName: 'test_host_name',
    hostScheme: 'https',
    apiVersion: LATEST_API_VERSION,
    isEmbeddedApp: false,
    isPrivateApp: false,
    sessionStorage: new MemorySessionStorage(),
    customShopDomains: undefined,
    billing: undefined,
  };
}

beforeEach(() => {
  shopify = shopifyApi(getNewTestConfig());
});

export {shopify, testConfig};

export async function signJWT(
  secret: string,
  payload: JwtPayload,
): Promise<string> {
  return new jose.SignJWT(payload as any)
    .setProtectedHeader({alg: 'HS256'})
    .sign(getHMACKey(secret));
}

export function buildMockResponse(obj: unknown): string {
  return JSON.stringify(obj);
}

export function buildExpectedResponse(obj: unknown): RequestReturn {
  const expectedResponse: RequestReturn = {
    body: obj,
    headers: expect.objectContaining({}),
  };

  return expect.objectContaining(expectedResponse);
}

export function queueMockResponse(
  body: string,
  partial: Partial<NormalizedResponse> = {},
) {
  mockTestRequests.queueResponse({
    statusCode: partial.statusCode ?? 200,
    statusText: partial.statusText ?? 'OK',
    headers: canonicalizeHeaders(partial.headers ?? {}),
    body,
  });
}

export function queueError(error: Error) {
  mockTestRequests.queueError(error);
}

export function queueMockResponses(
  ...responses: Parameters<typeof queueMockResponse>[]
) {
  for (const [body, response] of responses) {
    queueMockResponse(body, response);
  }
}

// Slightly hacky way to grab the Set-Cookie header from a response and use it as a request's Cookie header
export async function setSignedSessionCookie({
  request,
  cookieId,
}: {
  request: NormalizedRequest;
  cookieId: string;
}) {
  const cookies = new Cookies(request, {} as NormalizedResponse, {
    keys: [shopify.config.apiSecretKey],
  });
  await cookies.setAndSign('shopify_app_session', cookieId, {
    secure: true,
  });

  // eslint-disable-next-line require-atomic-updates
  request.headers.Cookie = cookies.toHeaders().join(';');
}

export async function createAndSaveDummySession({
  sessionId,
  isOnline,
  shop = 'test-shop.myshopify.io',
  expires = undefined,
  accessToken = undefined,
}: {
  sessionId: string;
  isOnline: boolean;
  shop?: string;
  expires?: Date;
  accessToken?: string;
}): Promise<Session> {
  const session = new Session({
    id: sessionId,
    shop,
    state: 'state',
    isOnline,
    expires,
    accessToken,
  });
  await expect(
    shopify.config.sessionStorage.storeSession(session),
  ).resolves.toEqual(true);

  return session;
}
