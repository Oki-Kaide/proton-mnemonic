import { Numeric } from '@proton/js';
import { BIP32Interface } from '@proton/bip32';
import { calcBip32ExtendedKey, generateMnemonic } from './mnemonic';

export class Mnemonic {
  numWords = 15;
  phrase: string;
  passphrase?: string;
  bip32ExtendedKey: BIP32Interface;
  derivationPath = "m/44'/194'/0'/0";

  get strength() {
    return (this.numWords / 3) * 32;
  }

  constructor({
    phrase,
    passphrase,
    numWords,
  }: {
    phrase?: string;
    passphrase?: string;
    numWords?: number;
  } = {}) {
    this.numWords = numWords || this.numWords;
    this.phrase = phrase || generateMnemonic(this.strength);
    this.passphrase = passphrase;
    this.bip32ExtendedKey = calcBip32ExtendedKey({
      mnemonic: this.phrase,
      passphrase: this.passphrase,
      derivationPath: this.derivationPath,
    });
  }

  keyPairAtIndex(index: number, oldFormat?: boolean) {
    const key = this.bip32ExtendedKey.derive(index);
    const publicKeyRaw = {
      type: Numeric.KeyType.k1,
      data: new Uint8Array(key.publicKey),
    };
    const privateKeyRaw = {
      type: Numeric.KeyType.k1,
      data: new Uint8Array(key.privateKey!),
    };

    let publicKey: string;
    let privateKey: string;

    if (oldFormat) {
      publicKey = Numeric.publicKeyToLegacyString(publicKeyRaw);
      privateKey = Numeric.privateKeyToLegacyString(privateKeyRaw);
    } else {
      publicKey = Numeric.publicKeyToString(publicKeyRaw);
      privateKey = Numeric.privateKeyToString(privateKeyRaw);
    }

    return {
      index,
      publicKey,
      privateKey,
    };
  }
}
