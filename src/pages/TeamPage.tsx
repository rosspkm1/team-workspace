import { Button } from '@components/ui';
import { MEMBERS } from '@utils/members';
import styles from './TeamPage.module.css';

/**
 * Team directory page. Renders one keyboard-focusable row per seeded member
 * (name + role), driven by the shared `MEMBERS` module. The heading count is
 * derived from the same collection so it stays in sync with the list.
 */
export default function TeamPage() {
  return (
    <section aria-labelledby="team-heading">
      <h1 id="team-heading">Team ({MEMBERS.length})</h1>
      <ul className={styles.list}>
        {MEMBERS.map((member) => (
          <li key={member.id}>
            <Button
              variant="secondary"
              className={styles.row}
              data-member-id={member.id}
            >
              <span className={styles.name}>{member.name}</span>
              <span className={styles.role}>{member.role}</span>
            </Button>
          </li>
        ))}
      </ul>
    </section>
  );
}
