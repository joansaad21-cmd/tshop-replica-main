# Tshop Replica

clonar essa pagina exatamento igual https://ofertas-tshop.vercel.app/ventilador parte de checkout tambem igual

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/1653a232-673c-454f-a627-7ff9f9f3c6f7).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## ZuckPay PIX

Configure `ZUCKPAY_CLIENT_ID` and `ZUCKPAY_CLIENT_SECRET` in `.env.local` for local development and in Vercel under **Settings > Environment Variables**. Redeploy after adding or changing them. Never commit real credentials. The checkout uses ZuckPay's signed server-side API calls and polls transaction status; it does not require a webhook secret.
