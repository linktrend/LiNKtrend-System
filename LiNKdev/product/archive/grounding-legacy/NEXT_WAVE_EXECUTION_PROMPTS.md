# LiNKaios UI/UX Product Model Alignment Execution Prompts

Run one wave at a time. After each wave finishes, ask for an integration check before launching the next wave.

## Wave 1 — Product Model UI Foundation

1. **Codex** — `Execute LiNKdev/product/programs/linktrend-system/prompts/legacy/WP-226-linkaios-product-model-ui-foundation.prompt.md exactly; use LiNKdev/product/programs/linktrend-system/issues/legacy/WP-226-linkaios-product-model-ui-foundation.md as the work packet and update the required report before stopping.`

## Wave 2 — Parallel UI Surfaces

Run after WP-226 is committed and checked.

1. **Codex** — `Execute LiNKdev/product/programs/linktrend-system/prompts/legacy/WP-227-modules-and-project-types-ui.prompt.md exactly; use LiNKdev/product/programs/linktrend-system/issues/legacy/WP-227-modules-and-project-types-ui.md as the work packet and update the required report before stopping.`
2. **Codex** — `Execute LiNKdev/product/programs/linktrend-system/prompts/legacy/WP-228-projects-plane-ui-semantics.prompt.md exactly; use LiNKdev/product/programs/linktrend-system/issues/legacy/WP-228-projects-plane-ui-semantics.md as the work packet and update the required report before stopping.`
3. **Codex** — `Execute LiNKdev/product/programs/linktrend-system/prompts/legacy/WP-229-linkbots-project-work-context-ui.prompt.md exactly; use LiNKdev/product/programs/linktrend-system/issues/legacy/WP-229-linkbots-project-work-context-ui.md as the work packet and update the required report before stopping.`
4. **Codex** — `Execute LiNKdev/product/programs/linktrend-system/prompts/legacy/WP-230-linkbrain-client-vendor-memory-ui.prompt.md exactly; use LiNKdev/product/programs/linktrend-system/issues/legacy/WP-230-linkbrain-client-vendor-memory-ui.md as the work packet and update the required report before stopping.`
5. **Codex** — `Execute LiNKdev/product/programs/linktrend-system/prompts/legacy/WP-231-linkskills-terminology-governance-ui.prompt.md exactly; use LiNKdev/product/programs/linktrend-system/issues/legacy/WP-231-linkskills-terminology-governance-ui.md as the work packet and update the required report before stopping.`

## Wave 3 — Integration And Human Review Proof

Run after WP-227 through WP-231 are committed and checked.

1. **Codex** — `Execute LiNKdev/product/programs/linktrend-system/prompts/legacy/WP-232-uiux-integration-proof-and-review-readiness.prompt.md exactly; use LiNKdev/product/programs/linktrend-system/issues/legacy/WP-232-uiux-integration-proof-and-review-readiness.md as the work packet and update the required report before stopping.`

## Launch Notes

- Use clean packet-specific worktrees only.
- Wave 2 packets may run in parallel after WP-226 because they target separate UI areas.
- WP-232 must run last and integrate all packet outputs.
- Do not produce completion percentages.
- Every packet must commit intended files and update its report before stopping.
