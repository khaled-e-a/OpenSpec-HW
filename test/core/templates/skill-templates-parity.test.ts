import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';

import {
  type SkillTemplate,
  getApplyChangeSkillTemplate,
  getArchiveChangeSkillTemplate,
  getBulkArchiveChangeSkillTemplate,
  getCiSkillTemplate,
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
  getOpsxCiCommandTemplate,
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
  getExploreSkillTemplate: '31a89eea597a543c114ba77d99f8a9b09e094912ebbc4ae79179e634d1b86622',
  getNewChangeSkillTemplate: 'f7f553d923d85b104ebe12e0da0f3f273beaca0f40f355645f536cf41a261d15',
  getContinueChangeSkillTemplate: 'b260a46551c75e50a4a1f6efe495021c34ff036a44029fe52a76d3664a4b3d4c',
  getApplyChangeSkillTemplate: 'eb31cd0ad2a31470402adb57655ec5482901d66c575f4760b72bd2c3f0b61ce1',
  getFfChangeSkillTemplate: '711a4b3f84b845138c8c0f31023a868f1008f148c26b3ac8e66ccc45bb1b5cdf',
  getSyncSpecsSkillTemplate: '41aa3b12a8757911b2876c32099a828b0d358c6ecfacb7135a2a95a3c76f7a2f',
  getOnboardSkillTemplate: '55873510f9f392d1521492a26d0a8cb9a00059be47ff9ced11ca4f811d368d4a',
  getOpsxExploreCommandTemplate: '4d30adef40bd687aa0b4a5898f138c994d30b4555a65bedcec8fbc9060dbac15',
  getOpsxNewCommandTemplate: '6b763b7b8e5191490b23df8c2057829c92dd60ac461d9859744c167c73a18cbc',
  getOpsxContinueCommandTemplate: '2d29dee4bfa23e959e6971f9035fd582388ba0a336335ea2fea7c840db8a3f3e',
  getOpsxApplyCommandTemplate: 'bc4a47315a5d4d24ab7420616262636bc74f1c05d9443930389dd98abb7c76cf',
  getOpsxFfCommandTemplate: '25016f0b3e204bbdb37e4a58441abe087b829a13c337d385faab3d8812b17b5a',
  getArchiveChangeSkillTemplate: 'd8863ba21f444f97bfa8ba80743a7974ed4132a3968e9cd176117c407b18e593',
  getBulkArchiveChangeSkillTemplate: 'f56100c59d4ff68ea3d1c2565cb7f9a7e12e0b6f08284de982f78579c1544da3',
  getOpsxSyncCommandTemplate: '8853e82d430ae15085208a9d123c1a3dde057b01e2c69f2fe4158a6bbd793b7a',
  getVerifyChangeSkillTemplate: '48f1ff82cc4d4f2b0edef69ef7e886b3017f03afe8285ed8c29d4f6f49cc46be',
  getOpsxArchiveCommandTemplate: 'f935c7a95cf16228ef07f30be908bd8ca999e213567bd305e005afb713603749',
  getOpsxOnboardCommandTemplate: 'a8677d6fbe092af550cef0ca6e5c3d1b70c041cfa9ddafa6edca6d4d993b3d8c',
  getOpsxBulkArchiveCommandTemplate: '0a1ebc238fb67d7281d43ee84184ce15bfbce68a9c4e4edf10d5745a541a969a',
  getOpsxVerifyCommandTemplate: 'da6545abbbc7502da5901e7ff141595545d415d4c8ad758e33b16ee8f299ae84',
  getOpsxProposeSkillTemplate: '48a5e70f83f650f347b10469bf066ff6945526a1139a8cb50647f72f45af4a50',
  getOpsxProposeCommandTemplate: 'c8268972689114a214f8f619736178870a85b56602e59db50f4eb76135bc6e13',
  getFeedbackSkillTemplate: '6c462ddce227b01774b0d48ee52c8968937ef74cb969533444f1ecc26134c02d',
  getGenTestsSkillTemplate: '9612eba4c8d895a08ba13081a58de410a5a076223c29f1420574ae0367c06f7c',
  getOpsxGenTestsCommandTemplate: '28bccfdf6d8b73c6302634fb09446dd7c559ce9ca0dd263e03c54848ef8631c7',
  getRunTestsSkillTemplate: '3cc1b1963190b10cc625140db5eeb900f911b420f901522d1ff6015e80e8ad22',
  getOpsxRunTestsCommandTemplate: '66b8a649499f73b07ec6b8fc5ec0a37b79f21e8c1d4cf9fa94732cabf4a6b499',
  getCiSkillTemplate: '409bbc0c67b61a1d0597502af7e8e296d1f2bd5f9bb4def02b7f9261febed775',
  getOpsxCiCommandTemplate: 'b7fa01b42605cadc0cf4056b8cc105a4a1a6db3ccce85134b361928b56680148',
};

const EXPECTED_GENERATED_SKILL_CONTENT_HASHES: Record<string, string> = {
  'openspec-explore': '52694707f042369e11a58c4946ba91b18b3a8dd6073809299bc23f008acbbaaa',
  'openspec-new-change': 'afbb94b79957f94f4b71f1e58482799131874a4d77c5a8bc7936becd6393db17',
  'openspec-continue-change': 'c34d92cde714bc97186d302009832c4c8b55b2f5724221acc2279884b8e42cf9',
  'openspec-apply-change': 'bc000cd6594fbaafbaf88ba98916c8e9575c08241df51332eb7e913648094e65',
  'openspec-ff-change': 'b3da7c140e3c67e1d91c70a64b57ac0b4afe9be54ae0605840c75cfc2514022a',
  'openspec-sync-specs': '6774c4742675d1cd150a184b187446b920e0c9aac07c58446513660b1c4a5d7d',
  'openspec-archive-change': '02d7efb2a09283fc6bc049af74798ce03ec6fe998c342ebf789ce1cd2b96ae7f',
  'openspec-bulk-archive-change': 'd4f3af709ae572d12f4622ebd8fce184ea9547753ac0076c8c7f934fe29fd7b0',
  'openspec-verify-change': 'd1c34513f316cc129ca4bb50316460b4dfecbaa4b342e906884de9acd8c22635',
  'openspec-onboard': '25acf60392736c2570fa39bbd65de39e0af9b21515cbd9480806b67cc5244e64',
  'openspec-propose': '7bf9c63107839a4ff968da4e844b0c354bcfeebf523e3612e1fe0c3e0626642d',
  'openspec-gen-tests': '0db0906a13e6b4171ca4748a73931e99c64d1c8726dad04e5fe2277dd0fd549a',
  'openspec-run-tests': 'df3b830d4e39dabf3e7983cac068307352eaa68ee18c90bdc1e7619a27ba3e1c',
  'openspec-ci': 'f91200912a5a4ee3a88e57e20541024c47c875618969252771ecb21c7c460b6b',
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
      getCiSkillTemplate,
      getOpsxCiCommandTemplate,
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
      ['openspec-ci', getCiSkillTemplate],
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
