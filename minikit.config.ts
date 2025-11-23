const ROOT_URL =
  process.env.NEXT_PUBLIC_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'http://localhost:3000');

/**
 * MiniApp configuration object. Must follow the Farcaster MiniApp specification.
 *
 * @see {@link https://miniapps.farcaster.xyz/docs/guides/publishing}
 */


export const minikitConfig = {
  accountAssociation: {
    header: "eyJmaWQiOjQyOTkxOSwidHlwZSI6ImF1dGgiLCJrZXkiOiIweDUyMGE0ZDAwMTYxODQ4YjM0MkI4RkRkRjlmYTc0YTk0Njc3ZTIyNkEifQ",
    payload: "eyJkb21haW4iOiJiYXNlLW1pbmktYXBwLXBpLnZlcmNlbC5hcHAifQ",
    signature: "vFWLo2eaGVZLyRx4DbGNdu6Yyl5JjT3z+sTUCWbNc9MN2JsElProF68K2fwGsPWlaPD910ows56ukcDA2+agexw="
  },
  miniapp: {
    version: "1",
    name: "alpha.markets", 
    subtitle: "Monetize your knowledge", 
    description: "The marketplace for exclusive insights and alpha.",
    screenshotUrls: [`${ROOT_URL}/screenshot-portrait.png`],
    iconUrl: `${ROOT_URL}/icon.png`,
    splashImageUrl: `${ROOT_URL}/splash.png`,
    splashBackgroundColor: "#ffffff",
    homeUrl: ROOT_URL,
    webhookUrl: `${ROOT_URL}/api/webhook`,
    primaryCategory: "business",
    tags: ["marketplace", "knowledge", "alpha", "monetization"],
    heroImageUrl: `${ROOT_URL}/hero.png`, 
    tagline: "Monetize your alpha",
    ogTitle: "alpha.markets",
    ogDescription: "Monetize your specific knowledge.",
    ogImageUrl: `${ROOT_URL}/hero.png`,
  },
} as const;

