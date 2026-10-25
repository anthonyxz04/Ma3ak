# Online payments for Ma3ak in Lebanon — research notes

Researched 25 October 2026. Payment availability in Lebanon changes often. Several sources below are vendor marketing pages or forum posts, so treat every point as something to **confirm directly with the provider in writing** before choosing one.

## What Ma3ak does today

- **No online payments.** Nothing is charged on the website, and no card data is collected or stored anywhere.
- **Deposits and payments happen offline** (cash, bank transfer, wallet), as described in the quote the customer accepts. Each payment is *recorded* on the booking:
  - by the provider ("deposit received"), or
  - by a MA3AK administrator, who can also record refunds.
- **Each record has a unique key**, so a double click or a retry can't record it twice.
- **Payment status is separate from booking status.** A booking waiting for its deposit moves to *confirmed* only once the recorded deposit covers the amount agreed.
- **Commission is recorded, not collected.** The rate is fixed on each booking when the price is agreed. MA3AK invoices providers itself.
- **Payouts are recorded by hand** in Admin → Commission & payments.
- **Webhook placeholder.** `POST /api/payments/webhook/:provider` exists and answers *501 Not configured*. It accepts nothing until a real provider is connected and tested.

## What a marketplace payment provider needs to offer

Ma3ak would need most of the following:

1. **Card acceptance for local and foreign cards,** in USD (and LBP if wanted), through a hosted payment page so Ma3ak never touches card numbers.
2. **Split payments or a payout API,** so a customer's payment can be divided between the provider and Ma3ak's commission, or paid out to providers.
3. **Refunds through the API.**
4. **Signed webhooks plus a server-side status check,** so Ma3ak can confirm every payment itself instead of trusting a browser redirect.
5. **Settlement to an account Ma3ak can actually use.**

## Options found

| Provider | What sources say | Marketplace splits / payouts | Fit for Ma3ak |
|---|---|---|---|
| **Stripe (incl. Connect)** | Not available to businesses registered in Lebanon, per an incorporation vendor's article. Its suggested workaround is a UK company. Stripe's own rules say *both* the platform and connected accounts must be in supported countries. | Connect needs providers in supported countries, so it isn't possible for Lebanon-based providers. | Only if Ma3ak is incorporated abroad, and even then providers in Lebanon can't be connected accounts. **Not recommended.** |
| **areeba** (Beirut) | Payment processor for banks and fintechs in Lebanon. Third-party listings describe merchant acquiring and website integration. Google Pay enabled in Lebanon (Sept 2025). | No public split or payout API found. | **Strong candidate** for card acceptance via a Lebanese bank or areeba directly. Ask about e-commerce acquiring, settlement currency, refunds and webhooks. |
| **Whish Pay** (Whish Money) | Wallet checkout with over 1 million wallet users. Live on Shopify. Settlement is advertised as instant. A community-built package documents a hosted "collect URL", success and failure callbacks, a server-side status check, a sandbox, and USD/LBP. | Not documented publicly. Refunds and webhook signatures aren't documented in public sources. | **Strong candidate** for wallet payments (very common in Lebanon). Ask Whish for official merchant API docs, refunds, webhook signing and payouts to providers' Whish wallets. |
| **NetCommerce** | Listed by the Ministry of Economy as a card gateway with partner banks Fransabank and Crédit Libanais (an older list, about 2018). A 2025 forum user couldn't reach them. | Unknown. | Check whether it is still operating. |
| **Bankmed e-Payment** | Listed by the Ministry of Economy as a Visa/Mastercard internet gateway (older list). | Unknown. | Ask Bankmed or your own bank about e-commerce acquiring today. |
| **Amazon Payment Services (ex-PAYFORT)** | Listed by the Ministry of Economy as operating in Lebanon (older list). Current status not confirmed. | Unknown for Lebanon. | Confirm availability for a Lebanese company before spending time on it. |
| **Tap Payments** | Operates in 9 countries (Sept 2025); Lebanon isn't named. A 2025 forum reply says it doesn't accept unregistered companies. | Has marketplace features in its own markets. | Only if Ma3ak has a company in one of Tap's countries. |
| **Merchant-of-record services** (e.g. Dodo Payments) | Accept cards from buyers in Lebanon and settle to the seller. | Built for digital products sold by one seller, not marketplaces paying many local providers. | **Not suitable** for event-service bookings. |

## Recommendation

1. **Keep the current model for launch** (implemented and tested).
   - Providers collect deposits directly, and payments are recorded on Ma3ak.
   - MA3AK invoices commission monthly from the commission ledger.
   - There's no regulatory risk of holding customer money.
2. **Add online deposits next, with one local provider:**
   - **Whish Pay** for wallets, and/or **areeba** (through a Lebanese bank) for cards.
   - Start with Ma3ak *not* holding funds for providers, unless a lawyer confirms Ma3ak may collect money on behalf of third parties under Lebanese rules.
   - If Ma3ak does collect, it pays providers out by bank transfer or Whish and records each payout. That ledger already exists.
3. **Questions to send each provider:**
   - Do you onboard a Lebanese SAL/SARL?
   - Can you settle in fresh USD, and to which account?
   - Is there a hosted checkout page?
   - Do you have signed webhooks, a status API, and a refund API?
   - Can one payment be split, or can you pay out to many sub-merchants?
   - What are your fees and your chargeback rules?

## What's needed from you before any payment code is switched on

- **A registered business** (Ma3ak's legal entity) and the bank account where funds settle.
- **A merchant contract** with the chosen provider, plus **sandbox credentials**.
- **Production keys** later. These go only in Netlify environment variables, never in the code or the website.
- **A legal check** of the partner terms and the refund and cancellation policy.

Once these exist, the integration is:
- a hosted checkout,
- a webhook verified by its signature *and* by a server-side status call,
- events stored once in `payment_events`, then recorded as a payment.

It must be tested in the provider's sandbox first. Nothing will be shown as "paid online" until that end-to-end test has passed.

## Sources

- [Ministry of Economy and Trade — Online payment platforms for SMEs and start-ups](https://economy.gov.lb/en/services/support-to-smes/online-payment-platforms-for-smes-and-start-ups)
- [Stripe Support — Pay out to connected accounts in other countries](https://support.stripe.com/questions/pay-out-to-connected-accounts-in-other-countries)
- [Incorpuk — Is Stripe available in Lebanon? (vendor article)](https://incorpuk.com/blog/open-stripe-account-in-lebanon/)
- [Business Wire — areeba partners with Entrust for Google Pay in Lebanon (Sept 2025)](https://www.businesswire.com/news/home/20250916059148/en/areeba-Partners-with-Entrust-to-Become-First-to-Market-with-Google-Pay-Enablement-in-Lebanon)
- [Akurateco — areeba payment method overview (third-party)](https://akurateco.com/payment-methods/areeba)
- [Zawya — Whish Money launches Whish Pay on Shopify](https://www.zawya.com/en/press-release/companies-news/whish-money-launches-on-shopify-leading-the-regions-first-cardless-checkout-e53619rq)
- [Packagist — laravel-whish-pay (community package, not official)](https://packagist.org/packages/ahmad-chebbo/laravel-whish-pay)
- [Shopify Community — Payment gateways for Lebanon (2024–2025 thread)](https://community.shopify.com/t/payment-gateways-for-lebanon/373716)
- [Sharikat Mubasher — Tap Payments expands to 9 countries (Sept 2025)](https://en.sharikatmubasher.com/media-hub/news/21507114/tap-payments-expands-to-9-countries-eyes-global-partnerships)
- [Dodo Payments — Accept payments in Lebanon (vendor page)](https://dodopayments.com/payments-in/lebanon)
