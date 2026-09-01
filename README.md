# SwiftTop — VTU (Virtual Top-Up) App

A production-ready, cross-platform React Native app for buying and reselling **airtime, data bundles, cable TV subscriptions, electricity tokens, exam pins, and betting wallet funding** across Nigeria. Built with Expo SDK 57 for iOS + Android.

The app ships with a fully working offline **mock provider** so the entire flow (auth → catalog → checkout → PIN → delivery → history) works out of the box with zero configuration. Swapping in a real VTU API (vtu.ng, pairgate, peyflex) is a one-line config change.

---

## Business model

SwiftTop is a wholesale-to-retail VTU reselling platform:

- **Dealer price** — the cost to the owner (what upstream providers charge you).
- **Selling price** — what customers pay.
- **Your margin** = `sellingPrice − dealerPrice`, recorded as `profit` on every order.

All product pricing (with realistic 2026 Nigerian rates) lives in `src/services/catalog/catalog-data.ts`. Every order records the exact margin earned, and margins are visible on the success screen and in history.

Example margins built into the catalog: ~2.5–3% on airtime, up to ~15% on SME data, ₦100–₦200 flat fees on cable/electricity/education, and 1% + ₦50 on betting top-ups.

---

## Features

- **Auth & onboarding** — register or login with phone number, OTP verification (demo OTP shown on-screen), 4-digit transaction PIN set at signup.
- **Home dashboard** — wallet balance card, quick actions, popular data bundles, recent transactions, referral banner.
- **Services** — buy flow for:
  - Airtime (MTN, Glo, Airtel, 9mobile; ₦100–₦5,000 + custom)
  - Data bundles (SME, SME2, CG, Gifting, plan catalog)
  - Cable TV (DStv, GOtv, StarTimes, Showmax) with IUC verification
  - Electricity (Ikeja, Abuja, Eko, Kaduna, etc.) with meter verification and instant token payout
  - Exam pins (WAEC, NECO, NABTEB, JAMB) with scratch-card PIN payout
  - Betting (Bet9ja, NairaBet, 1xBet, BetKing) wallet funding
- **Checkout** — order summary, wallet-balance check, 4-digit PIN authorization (haptic feedback, wrong-PIN handling).
- **Wallet** — funded via dedicated virtual bank account (demo), card, and USSD placeholders; lifetime spend/funded stats.
- **Transactions** — full history with category/status filters and pull-to-refresh.
- **Profile & settings** — profile editing, referral codes with ₦500 bonus, change PIN (verify → new → confirm), biometric lock (Face ID / fingerprint), support portal.

---

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | Expo SDK 57 (`expo ~57.0.17`, React Native 0.86.3, React 19.2.3) |
| Language | TypeScript ~6.0.3 (strict) |
| Routing | `expo-router` ~57 (file-based, typed routes) |
| Server state | `@tanstack/react-query` ^5.102.8 |
| Client state | `zustand` ^5.0.15 (session + toasts) |
| UI animation | `react-native-reanimated` 4.5.1 |
| Lists | `@shopify/flash-list` |
| Security | `expo-secure-store`, `expo-crypto` (SHA-256 PIN hashing), `expo-local-authentication` |
| Forms/UX | `expo-haptics`, `expo-clipboard`, `expo-linear-gradient`, `@expo/vector-icons` |
| Persistence | `@react-native-async-storage/async-storage` |

---

## Getting started

```bash
npm install
npm run android   # or: npm run ios / npm run web
```

The app boots in **mock mode** with a demo wallet balance of ₦25,000. Register a new account, note the demo OTP code shown on the verification screen, set a PIN, and you can buy services immediately.

### Scripts

- `npm start` — start the Expo dev server
- `npm run android` / `npm run ios` / `npm run web`
- `npm run lint` — ESLint (`eslint-config-expo` + React Compiler rules)
- `npx tsc --noEmit` — type checking
- `npx expo export --platform android` — offline bundle verification

---

## Connecting a real VTU provider

Everything is behind a single `VtuProvider` interface (`src/services/api/mock-provider.ts`). Swap providers in `src/constants/config.ts` via `AppConfig.provider` — the UI, stores, and screens never change.

```env
# .env
EXPO_PUBLIC_VTU_PROVIDER=vtu.ng        # mock | vtu.ng | pairgate | peyflex
EXPO_PUBLIC_VTU_NG_KEY=your-key        # vtu.ng: also EXPO_PUBLIC_VTU_NG_USER + EXPO_PUBLIC_VTU_NG_PASSWORD (basic auth)
EXPO_PUBLIC_PAIRGATE_KEY=your-key
EXPO_PUBLIC_PEYFLEX_KEY=your-key
```

Adapters (`src/services/api/providers.ts`):

| Provider | Endpoint | Auth |
| --- | --- | --- |
| vtu.ng | `https://vtu.ng/wp-json/api/v1` | Basic auth + key, `form-encoded` |
| pairgate | `https://pairgate.com/api` | `Authorization` header |
| peyflex | `https://peyflex.com/api` | `x-api-key` header |

Each adapter maps the provider's responses into SwiftTop's own `OrderResult`, `Wallet`, `Transaction`, and `Catalog` shapes. If a provider exposes a price-list endpoint, extend `getCatalog()` to hydrate the bundled catalog with live dealer prices (the bundled catalog is used until then). Verify the field names against the provider's current docs before going live — pricing and response shapes change frequently.

**Always keep upstream keys on the **server** and proxy requests in production** — keys placed in `.env` with the `EXPO_PUBLIC_` prefix are inlined into the app bundle.

---

## Payment / wallet funding

Wallet funding is designed for a payment gateway, not coded to one vendor:

- **Bank transfer** — provision a dedicated virtual account via Paystack / Flutterwave / Monnify; credit the wallet from the gateway's webhook (`requestVirtualAccount()` currently documents the contract). The demo confirms instantly.
- **Card** — replace the placeholder sheet with a Paystack / Flutterwave checkout.
- **USSD** — route through an aggregator such as Billstack or Flutterwave USSD; a sample shortcode is shown.

The funding flow lives in `src/services/api/*` and `src/app/(tabs)/wallet.tsx`.

---

## Architecture

```
src/
  app/                 # expo-router file-based routes
    (auth)/            # welcome, login, register, verify-otp, create-pin
    (tabs)/            # home, services, transactions, wallet, profile
    buy/               # airtime, data, cable, electricity, education, betting
    checkout.tsx       # PIN-authorized purchase (transparent modal)
    success.tsx        # order result, token/PIN payout, copy-to-clipboard
    referral.tsx       # referral code + share
    security.tsx       # change PIN, biometric lock
    support.tsx        # contact + FAQ
  components/
    brand/             # logo, network/provider badges, category icons, wallet card
    buy/               # picker field, amount chips
    ui/                # screen, button, input, card, chip, badge, list-item,
                       # skeleton, empty-state, toast, otp-input, pin-pad, bottom-sheet
  constants/           # theme tokens (light/dark), AppConfig
  features/checkout/   # CheckoutOrder model + pushCheckout helper
  hooks/               # use-theme, use-vtu (all react-query hooks)
  lib/                 # format, validation, id generation
  services/
    api/               # types, catalog-data, mock-provider, provider adapters, client
    auth/              # mock auth backend + PIN hashing
    storage/           # secure store + AsyncStorage
  store/               # zustand: session-store, app-store (toasts)
```

**Data flow:** buy screens build a `CheckoutOrder` → `router.push('/checkout')` → user authorizes with PIN → `usePurchase` mutation calls `getProvider().purchase()` → react-query invalidates wallet/transactions queries → success screen shows result (including the generated electricity token or exam PIN).

---

## Demo-vs-live notes

- **Mock provider** simulates delivery latency, a ~4% `pending` status chance, inclusive wallet management, meter/IUC verification, funding, and token/PIN generation. All state persists locally per registered user.
- **In production**, replace `mock-auth` with your backend (the function signatures mirror a real auth API), move wallet balance + transaction storage server-side, and enable server-side provider transactions.