export function generateStaticParams() {
  // Pre-generate some common search terms
  return [
    { q: 'iphone' },
    { q: 'macbook' },
    { q: 'samsung' },
    { q: 'playstation' },
    { q: 'airpods' },
  ];
}