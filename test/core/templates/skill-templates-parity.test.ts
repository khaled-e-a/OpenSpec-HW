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
  getArchiveChangeSkillTemplate: 'b174182bc2a844138bbbc07eee512a4a25ad11c477046cb33510cf9ace581d6c',
  getBulkArchiveChangeSkillTemplate: 'f56100c59d4ff68ea3d1c2565cb7f9a7e12e0b6f08284de982f78579c1544da3',
  getOpsxSyncCommandTemplate: '8853e82d430ae15085208a9d123c1a3dde057b01e2c69f2fe4158a6bbd793b7a',
  getVerifyChangeSkillTemplate: 'a22b1250b536b09366c10355b262303c68dcda2574675453099c96f5ef0c61f8',
  getOpsxArchiveCommandTemplate: 'c7fbe9da6e2f01e7268eb4ad7532a308b35304f5049762d187d77b7e4284774c',
  getOpsxOnboardCommandTemplate: 'a8677d6fbe092af550cef0ca6e5c3d1b70c041cfa9ddafa6edca6d4d993b3d8c',
  getOpsxBulkArchiveCommandTemplate: '0a1ebc238fb67d7281d43ee84184ce15bfbce68a9c4e4edf10d5745a541a969a',
  getOpsxVerifyCommandTemplate: '85cc9c24130d4e38699f173c8eb5445877ea554d4fb7833be7fd691d28437f38',
  getOpsxProposeSkillTemplate: '48a5e70f83f650f347b10469bf066ff6945526a1139a8cb50647f72f45af4a50',
  getOpsxProposeCommandTemplate: 'c8268972689114a214f8f619736178870a85b56602e59db50f4eb76135bc6e13',
  getFeedbackSkillTemplate: '6c462ddce227b01774b0d48ee52c8968937ef74cb969533444f1ecc26134c02d',
  getGenTestsSkillTemplate: '9612eba4c8d895a08ba13081a58de410a5a076223c29f1420574ae0367c06f7c',
  getOpsxGenTestsCommandTemplate: '28bccfdf6d8b73c6302634fb09446dd7c559ce9ca0dd263e03c54848ef8631c7',
  getRunTestsSkillTemplate: '3cc1b1963190b10cc625140db5eeb900f911b420f901522d1ff6015e80e8ad22',
  getOpsxRunTestsCommandTemplate: '66b8a649499f73b07ec6b8fc5ec0a37b79f21e8c1d4cf9fa94732cabf4a6b499',
  getCiSkillTemplate: '685e690392ba253307b76324cb528c3fa4b6292ebf0b4c8a5caa0de991e4860c',
  getOpsxCiCommandTemplate: '79e30e776151e59c1df385e47c8a4c20c845a344c64987a2d319fba718e4de3a',
};

const EXPECTED_GENERATED_SKILL_CONTENT_HASHES: Record<string, string> = {
  'synergyspec-explore': '52694707f042369e11a58c4946ba91b18b3a8dd6073809299bc23f008acbbaaa',
  'synergyspec-new-change': 'afbb94b79957f94f4b71f1e58482799131874a4d77c5a8bc7936becd6393db17',
  'synergyspec-continue-change': 'c34d92cde714bc97186d302009832c4c8b55b2f5724221acc2279884b8e42cf9',
  'synergyspec-apply-change': 'bc000cd6594fbaafbaf88ba98916c8e9575c08241df51332eb7e913648094e65',
  'synergyspec-ff-change': 'b3da7c140e3c67e1d91c70a64b57ac0b4afe9be54ae0605840c75cfc2514022a',
  'synergyspec-sync-specs': '6774c4742675d1cd150a184b187446b920e0c9aac07c58446513660b1c4a5d7d',
  'synergyspec-archive-change': '0fe834ae1d9e96317f56123d8033cabfcec6f64089de7217605afacb53a74791',
  'synergyspec-bulk-archive-change': 'd4f3af709ae572d12f4622ebd8fce184ea9547753ac0076c8c7f934fe29fd7b0',
  'synergyspec-verify-change': '7c7000c697ae5f45eda293186f9e94208fc42124dbbc3fc5f254483d11f9a060',
  'synergyspec-onboard': '25acf60392736c2570fa39bbd65de39e0af9b21515cbd9480806b67cc5244e64',
  'synergyspec-propose': '7bf9c63107839a4ff968da4e844b0c354bcfeebf523e3612e1fe0c3e0626642d',
  'synergyspec-gen-tests': '0db0906a13e6b4171ca4748a73931e99c64d1c8726dad04e5fe2277dd0fd549a',
  'synergyspec-run-tests': 'df3b830d4e39dabf3e7983cac068307352eaa68ee18c90bdc1e7619a27ba3e1c',
  'synergyspec-ci': 'c913cd15c73035b007936205fc2a9dcd0a8e1710e088a0be3af47f90babf299a',
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
      ['synergyspec-explore', getExploreSkillTemplate],
      ['synergyspec-new-change', getNewChangeSkillTemplate],
      ['synergyspec-continue-change', getContinueChangeSkillTemplate],
      ['synergyspec-apply-change', getApplyChangeSkillTemplate],
      ['synergyspec-ff-change', getFfChangeSkillTemplate],
      ['synergyspec-sync-specs', getSyncSpecsSkillTemplate],
      ['synergyspec-archive-change', getArchiveChangeSkillTemplate],
      ['synergyspec-bulk-archive-change', getBulkArchiveChangeSkillTemplate],
      ['synergyspec-verify-change', getVerifyChangeSkillTemplate],
      ['synergyspec-onboard', getOnboardSkillTemplate],
      ['synergyspec-propose', getOpsxProposeSkillTemplate],
      ['synergyspec-gen-tests', getGenTestsSkillTemplate],
      ['synergyspec-run-tests', getRunTestsSkillTemplate],
      ['synergyspec-ci', getCiSkillTemplate],
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
