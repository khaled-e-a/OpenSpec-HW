/**
 * Agent Skill Templates
 *
 * Compatibility facade that re-exports split workflow template modules.
 */

export type { SkillTemplate, CommandTemplate } from './types.js';

export { getExploreSkillTemplate, getOpsxExploreCommandTemplate } from './workflows/explore.js';
export { getNewChangeSkillTemplate, getOpsxNewCommandTemplate } from './workflows/new-change.js';
export { getContinueChangeSkillTemplate, getOpsxContinueCommandTemplate } from './workflows/continue-change.js';
export { getApplyChangeSkillTemplate, getOpsxApplyCommandTemplate } from './workflows/apply-change.js';
export { getFfChangeSkillTemplate, getOpsxFfCommandTemplate } from './workflows/ff-change.js';
export { getSyncSpecsSkillTemplate, getOpsxSyncCommandTemplate } from './workflows/sync-specs.js';
export { getArchiveChangeSkillTemplate, getOpsxArchiveCommandTemplate } from './workflows/archive-change.js';
export { getBulkArchiveChangeSkillTemplate, getOpsxBulkArchiveCommandTemplate } from './workflows/bulk-archive-change.js';
export { getVerifyChangeSkillTemplate, getOpsxVerifyCommandTemplate } from './workflows/verify-change.js';
export { getVerifySpecSkillTemplate, getOpsxVerifySpecCommandTemplate } from './workflows/verify-spec.js';
export { getOnboardSkillTemplate, getOpsxOnboardCommandTemplate } from './workflows/onboard.js';
export { getGenTestsSkillTemplate, getOpsxGenTestsCommandTemplate } from './workflows/gen-tests.js';
export { getRunTestsSkillTemplate, getOpsxRunTestsCommandTemplate } from './workflows/run-tests.js';
export { getCiSkillTemplate, getOpsxCiCommandTemplate } from './workflows/ci.js';
export { getOpsxProposeSkillTemplate, getOpsxProposeCommandTemplate } from './workflows/propose.js';
export { getFeedbackSkillTemplate } from './workflows/feedback.js';
export { getCompareImagesSkillTemplate } from './workflows/compare-images.js';
