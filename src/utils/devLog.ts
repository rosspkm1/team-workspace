/**
 * Development-only console confirmation for a successful key user action.
 *
 * This is the single place the environment guard lives: every caller imports
 * `devLog` instead of calling `console.*` (or checking the env) directly, so
 * the rule "dev-only" is defined once (DRY).
 *
 * The guard uses Vite's built-in `import.meta.env.DEV`, which Vite statically
 * replaces with a literal boolean. It is `true` under `vite` dev and `vitest`,
 * and `false` under `vite build`. Because the value is a compile-time literal
 * in a production build, the `if` branch below — together with the message
 * string passed into it — is removed by dead-code elimination and never
 * appears in the shipped bundle (not merely silenced at runtime).
 *
 * The flag is read at call time (not captured at module load) so runtime
 * behavior is unit-testable via `vi.stubEnv('DEV', false)`.
 *
 * Emitting a message is purely a console side effect: it renders nothing, adds
 * no DOM, and returns nothing.
 *
 * Any new happy path added by a later ticket should confirm its success by
 * calling this same util — do not reintroduce raw `console.*` calls or
 * environment checks elsewhere.
 *
 * @param message - Human-readable confirmation that names the action which
 *   completed and that it succeeded (e.g. `'Navigated to Projects page'`).
 */
export function devLog(message: string): void {
  if (import.meta.env.DEV) {
    console.log(`[devlog] ${message}`);
  }
}
