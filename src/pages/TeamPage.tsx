import { useMemo, useState } from 'react';
import { Button, Card, Input } from '@components/ui';
import { MEMBERS } from '@utils/members';
import styles from './TeamPage.module.css';

/**
 * Team directory page. Renders one keyboard-focusable row per seeded member
 * (name + role), driven by the shared `MEMBERS` module, plus a case-insensitive
 * search filter and a detail panel for the selected member.
 *
 * Search and selection are independent: typing only narrows which rows render,
 * while the selected member (stored by id) keeps showing in the detail panel
 * even when the current filter hides its row. The heading count stays the total
 * member count, not the filtered count.
 */
export default function TeamPage() {
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filteredMembers = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (normalized === '') {
      return MEMBERS;
    }
    return MEMBERS.filter(
      (member) =>
        member.name.toLowerCase().includes(normalized) ||
        member.role.toLowerCase().includes(normalized),
    );
  }, [query]);

  const selectedMember = selectedId
    ? MEMBERS.find((member) => member.id === selectedId) ?? null
    : null;

  return (
    <section aria-labelledby="team-heading">
      <h1 id="team-heading">Team ({MEMBERS.length})</h1>

      <div className={styles.layout}>
        <div className={styles.directory}>
          <Input
            label="Search members"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name or role"
          />

          {filteredMembers.length === 0 ? (
            <p className={styles.emptyState}>No members match your search</p>
          ) : (
            <ul className={styles.list}>
              {filteredMembers.map((member) => (
                <li key={member.id}>
                  <Button
                    variant="secondary"
                    className={styles.row}
                    data-member-id={member.id}
                    aria-pressed={member.id === selectedId}
                    onClick={() => setSelectedId(member.id)}
                  >
                    <span className={styles.name}>{member.name}</span>
                    <span className={styles.role}>{member.role}</span>
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <Card role="region" aria-labelledby="member-detail-heading" className={styles.detail}>
          <h2 id="member-detail-heading" className={styles.detailHeading}>
            Member details
          </h2>
          {selectedMember ? (
            <dl className={styles.detailList}>
              <dt className={styles.detailLabel}>Name</dt>
              <dd className={styles.detailValue}>{selectedMember.name}</dd>
              <dt className={styles.detailLabel}>Role</dt>
              <dd className={styles.detailValue}>{selectedMember.role}</dd>
              <dt className={styles.detailLabel}>Email</dt>
              <dd className={styles.detailValue}>{selectedMember.email}</dd>
            </dl>
          ) : (
            <p className={styles.detailPlaceholder}>Select a member to see details</p>
          )}
        </Card>
      </div>
    </section>
  );
}
