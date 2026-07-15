/** Fallback page rendered for any path not present in ROUTES. */
export default function NotFoundPage() {
  return (
    <section aria-labelledby="notfound-heading">
      <h1 id="notfound-heading">Page not found</h1>
      <p>The page you were looking for does not exist.</p>
    </section>
  );
}
