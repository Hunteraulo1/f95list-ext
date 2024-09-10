export const ssr = false;
export const prerender = true;

export function load({ url }) {
  const searchParams = Object.fromEntries(url.searchParams.entries());

  return { searchParams };
}
