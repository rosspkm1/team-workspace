/** Placeholder team page. Per-page content is delivered by later tickets. */
export default function TeamPage() {
  // Page-local member source; empty until a data layer lands in a later ticket.
  // The heading count is derived from this so it stays in sync with the list.
  const members: readonly unknown[] = [];

  return (
    <section aria-labelledby="team-heading">
      <h1 id="team-heading">Team ({members.length})</h1>
      <p>Team members will appear here.</p>
    </section>
  );
}
