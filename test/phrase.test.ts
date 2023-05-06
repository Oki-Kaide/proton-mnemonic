import { Mnemonic } from '../src';

const phrase =
  'reflect note upgrade mention marine sword track pride robust vessel tube sausage kind trick neglect';
const index = 0;
const publicKeyMock =
  'PUB_K1_71ESPbpkYsR9iQd1tgqxqZqUJFX8veJGUS5RnGGekq4Vb1ExPj';
const privateKeyMock =
  'PVT_K1_du8FBHSYpapVw17ZmWBU3u3dBCARMFe54X49yfPrFCUoXpADk';
const publicKeyLegacyMock =
  'EOS71ESPbpkYsR9iQd1tgqxqZqUJFX8veJGUS5RnGGekq4Vd64yg6';
const privateKeyLegacyMock =
  '5JTBhvdNX1Pa5WKH9mDQGWo2GE17NZDLMt8JHL2Qdj6qeTjzqE6';

describe('Mnemonic', () => {
  it('Phrase works', () => {
    const mnemonic = new Mnemonic({ phrase: phrase });
    const { publicKey, privateKey } = mnemonic.keyPairAtIndex(index);
    expect(publicKey).toEqual(publicKeyMock);
    expect(privateKey).toEqual(privateKeyMock);

    const {
      publicKey: publicKeyLegacy,
      privateKey: privateKeyLegacy,
    } = mnemonic.keyPairAtIndex(index, true);
    expect(publicKeyLegacy).toEqual(publicKeyLegacyMock);
    expect(privateKeyLegacy).toEqual(privateKeyLegacyMock);
  });
});
