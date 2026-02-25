import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';

import {
  type SkillTemplate,
  getApplyChangeSkillTemplate,
  getArchiveChangeSkillTemplate,
  getBulkArchiveChangeSkillTemplate,
  getContinueChangeSkillTemplate,
  getExploreSkillTemplate,
  getFeedbackSkillTemplate,
  getFfChangeSkillTemplate,
  getGenTestsSkillTemplate,
  getNewChangeSkillTemplate,
  getOnboardSkillTemplate,
  getOpsxApplyCommandTemplate,
  getOpsxArchiveCommandTemplate,
  getOpsxBulkArchiveCommandTemplate,
  getOpsxContinueCommandTemplate,
  getOpsxExploreCommandTemplate,
  getOpsxFfCommandTemplate,
  getOpsxGenTestsCommandTemplate,
  getOpsxNewCommandTemplate,
  getOpsxOnboardCommandTemplate,
  getOpsxRunTestsCommandTemplate,
  getOpsxSyncCommandTemplate,
  getOpsxProposeCommandTemplate,
  getOpsxProposeSkillTemplate,
  getOpsxVerifyCommandTemplate,
  getRunTestsSkillTemplate,
  getSyncSpecsSkillTemplate,
  getVerifyChangeSkillTemplate,
} from '../../../src/core/templates/skill-templates.js';
import { generateSkillContent } from '../../../src/core/shared/skill-generation.js';

const EXPECTED_FUNCTION_HASHES: Record<string, string> = {
  getExploreSkillTemplate: 'a2cd140b6746a8141565fc2a978aa4dd7d5e6aef605701c69f4595d469ce9258',
  getNewChangeSkillTemplate: '5989672758eccf54e3bb554ab97f2c129a192b12bbb7688cc1ffcf6bccb1ae9d',
  getContinueChangeSkillTemplate: '4679abc28653d4b1e251886f79f66f74a91fbe6dbc250612c83403d64aa41f74',
  getApplyChangeSkillTemplate: '0cc42689c953fd96f73f54b2cd52c75d0f4ba595004eb95d34428f17ea3a1958',
  getFfChangeSkillTemplate: '1456fbc7e1a60c36a50516cc498fe71394f947feb2479a7ef4b6b732894ae323',
  getSyncSpecsSkillTemplate: 'bded184e4c345619148de2c0ad80a5b527d4ffe45c87cc785889b9329e0f465b',
  getOnboardSkillTemplate: '2ad3e6bfcd4f58971021fc7f1c9e15e2cedf92dad6841c388cffb7f6ceb0a6d0',
  getOpsxExploreCommandTemplate: 'b60c59590a43b1054576676fef59a2973aa6d525f6c979425b8899aab2e181e5',
  getOpsxNewCommandTemplate: 'b61b4b056edb33d95cec3d38d23a260a31f4a2ac94c8ea157e11ce9cbcb764d2',
  getOpsxContinueCommandTemplate: '3bf2cf6e180a4edf28bdf5203c6998cd491f1ff055f6cac3bd7e4235fa274a18',
  getOpsxApplyCommandTemplate: '4eb8b5676b1e87ef9f4e77a1a44fb79bdeda2268c438b784593666a2759ec68d',
  getOpsxFfCommandTemplate: '1e0d5377ba142bb1855880195b5550ac2b81282b6f637b2812fd0e9d9fd8add1',
  getArchiveChangeSkillTemplate: '6f8ca383fdb5a4eb9872aca81e07bf0ba7f25e4de8617d7a047ca914ca7f14b9',
  getBulkArchiveChangeSkillTemplate: 'b40fc44ea4e420bdc9c803985b10e5c091fc472cdfc69153b962be6be303bddd',
  getOpsxSyncCommandTemplate: 'c7b83254e85c7116c63aa1c4181fb00a4325f35efa9d7f260e1077734ddcbebb',
  getVerifyChangeSkillTemplate: '63a213ba3b42af54a1cd56f5072234a03b265c3fe4a1da12cd6fbbef5ee46c4b',
  getOpsxArchiveCommandTemplate: 'fe9ae6b44546788b9314704ee47c121720b6fd4042fce410e95490366fb272bc',
  getOpsxOnboardCommandTemplate: '36f121316aac0cbe20987f50b43cff5fc64854a8353c4821ec71c1220e929535',
  getOpsxBulkArchiveCommandTemplate: 'eaaba253a950b9e681d8427a5cbc6b50c4e91137fb37fd2360859e08f63a0c14',
  getOpsxVerifyCommandTemplate: 'ad42e4c0eae1c3a48d0df20698135db93356d1de9c9a758875cedc84ef57789d',
  getOpsxProposeSkillTemplate: 'fba128b53c0e49ddc6b4280805c10a7440dfdb4f12f3efd59acde1a2324f8cbf',
  getOpsxProposeCommandTemplate: '2636af528ca0360600471a01c07b085046a12b8b6375152fc680122ca8b9a809',
  getFeedbackSkillTemplate: 'd7d83c5f7fc2b92fe8f4588a5bf2d9cb315e4c73ec19bcd5ef28270906319a0d',
  getGenTestsSkillTemplate: 'f72c5467e865bd6c81d1683c2a206945fe8a0aaf81c350f15a70bd9766fe344a',
  getOpsxGenTestsCommandTemplate: 'd3c7d91ce5c510049cdbe3f4bbb9e6a2baeadb21b210d88d305d4a64fad65ffe',
  getRunTestsSkillTemplate: 'ec88c13e655bf31e10b5b12b0ece8429c5da471e614eae954ac1e1cc738f898a',
  getOpsxRunTestsCommandTemplate: 'fbafca57fdd5900c340fefd70244b89b850f1078843e6694646d155ecfceaceb',
};

const EXPECTED_GENERATED_SKILL_CONTENT_HASHES: Record<string, string> = {
  'openspec-explore': '146b1a5d01755f729782d63a9b89abed0d94ef76e26044b31b9399e242c9e9e1',
  'openspec-new-change': 'c324a7ace1f244aa3f534ac8e3370a2c11190d6d1b85a315f26a211398310f0f',
  'openspec-continue-change': 'cc22b993d80a1d38f0a6d95beb8b233206c03c52dc09529768ecd9b07e867952',
  'openspec-apply-change': 'a81b422a64a3c243d49ebbd288e049971d571fd0dc85f91a103527e69d3b4918',
  'openspec-ff-change': '887836826432deb7be4b27e41dec46a96224f9fd7f8d5f279d6609f69c7d7c02',
  'openspec-sync-specs': 'b8859cf454379a19ca35dbf59eedca67306607f44a355327f9dc851114e50bde',
  'openspec-archive-change': 'f83c85452bd47de0dee6b8efbcea6a62534f8a175480e9044f3043f887cebf0f',
  'openspec-bulk-archive-change': 'a235a539f7729ab7669e45256905808789240ecd02820e044f4d0eef67b0c2ab',
  'openspec-verify-change': '30d07c6f7051965f624f5964db51844ec17c7dfd05f0da95281fe0ca73616326',
  'openspec-onboard': '370c7ba9edff00a371db8ee73ca446f62d67caaf1c9479378df66bdf7cd849cd',
  'openspec-propose': 'dc63b50a02abb7c8d6c213d233c8816dfa2772ef3431ee4cc5d6cfca2baf5cee',
  'openspec-gen-tests': '06db0d0caecfef2176c479833ccf6167cba32fcfe97e28ee63aaaebbb3963279',
  'openspec-run-tests': '027c3deccd7684a120e5e829525808c52bdff33b4d290a3ccde9714780fbf917',
};

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(',')}]`;
  }

  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => `${JSON.stringify(key)}:${stableStringify(item)}`);

    return `{${entries.join(',')}}`;
  }

  return JSON.stringify(value);
}

function hash(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

describe('skill templates split parity', () => {
  it('preserves all template function payloads exactly', () => {
    const functionFactories: Record<string, () => unknown> = {
      getExploreSkillTemplate,
      getNewChangeSkillTemplate,
      getContinueChangeSkillTemplate,
      getApplyChangeSkillTemplate,
      getFfChangeSkillTemplate,
      getSyncSpecsSkillTemplate,
      getOnboardSkillTemplate,
      getOpsxExploreCommandTemplate,
      getOpsxNewCommandTemplate,
      getOpsxContinueCommandTemplate,
      getOpsxApplyCommandTemplate,
      getOpsxFfCommandTemplate,
      getArchiveChangeSkillTemplate,
      getBulkArchiveChangeSkillTemplate,
      getOpsxSyncCommandTemplate,
      getVerifyChangeSkillTemplate,
      getOpsxArchiveCommandTemplate,
      getOpsxOnboardCommandTemplate,
      getOpsxBulkArchiveCommandTemplate,
      getOpsxVerifyCommandTemplate,
      getOpsxProposeSkillTemplate,
      getOpsxProposeCommandTemplate,
      getFeedbackSkillTemplate,
      getGenTestsSkillTemplate,
      getOpsxGenTestsCommandTemplate,
      getRunTestsSkillTemplate,
      getOpsxRunTestsCommandTemplate,
    };

    const actualHashes = Object.fromEntries(
      Object.entries(functionFactories).map(([name, fn]) => [name, hash(stableStringify(fn()))])
    );

    expect(actualHashes).toEqual(EXPECTED_FUNCTION_HASHES);
  });

  it('preserves generated skill file content exactly', () => {
    // Intentionally excludes getFeedbackSkillTemplate: skillFactories only models templates
    // deployed via generateSkillContent, while feedback is covered in function payload parity.
    const skillFactories: Array<[string, () => SkillTemplate]> = [
      ['openspec-explore', getExploreSkillTemplate],
      ['openspec-new-change', getNewChangeSkillTemplate],
      ['openspec-continue-change', getContinueChangeSkillTemplate],
      ['openspec-apply-change', getApplyChangeSkillTemplate],
      ['openspec-ff-change', getFfChangeSkillTemplate],
      ['openspec-sync-specs', getSyncSpecsSkillTemplate],
      ['openspec-archive-change', getArchiveChangeSkillTemplate],
      ['openspec-bulk-archive-change', getBulkArchiveChangeSkillTemplate],
      ['openspec-verify-change', getVerifyChangeSkillTemplate],
      ['openspec-onboard', getOnboardSkillTemplate],
      ['openspec-propose', getOpsxProposeSkillTemplate],
      ['openspec-gen-tests', getGenTestsSkillTemplate],
      ['openspec-run-tests', getRunTestsSkillTemplate],
    ];

    const actualHashes = Object.fromEntries(
      skillFactories.map(([dirName, createTemplate]) => [
        dirName,
        hash(generateSkillContent(createTemplate(), 'PARITY-BASELINE')),
      ])
    );

    expect(actualHashes).toEqual(EXPECTED_GENERATED_SKILL_CONTENT_HASHES);
  });
});
