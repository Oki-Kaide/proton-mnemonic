import { sha256 } from 'hash.js';
import BIP32Factory, { BIP32Interface } from '@proton/bip32';
import * as ecc from 'tiny-secp256k1';
import { mnemonicToSeedSync } from 'bip39';
import { wordlist } from './wordlist';
import crypto from '@jafri/isomorphic-webcrypto';

// You must wrap a tiny-secp256k1 compatible implementation
const bip32 = BIP32Factory(ecc);

/**
 * Next 4 functions from https://github.com/polkadot-js/common
 */
function binaryToByte(bin: string): number {
  return parseInt(bin, 2);
}

function bytesToBinary(bytes: number[]): string {
  return bytes.map((x: number) => x.toString(2).padStart(8, '0')).join('');
}

function deriveChecksumBits(entropyBuffer: Uint8Array): string {
  const ENT = entropyBuffer.length * 8;
  const CS = ENT / 32;
  const result = sha256()
    .update(entropyBuffer)
    .digest();

  return bytesToBinary(Array.from(result)).slice(0, CS);
}

function entropyToMnemonic(entropy: Uint8Array): string {
  // 128 <= ENT <= 256
  if (
    !(entropy.length % 4 === 0 && entropy.length >= 16 && entropy.length <= 32)
  ) {
    throw new Error('Invalid entropy');
  }

  const entropyBits = bytesToBinary(Array.from(entropy));
  const checksumBits = deriveChecksumBits(entropy);

  // we just set it prior, so this is a safe check
  return (entropyBits + checksumBits)
    .match(/(.{1,11})/g)!
    .map(binary => wordlist[binaryToByte(binary)])
    .join(' ');
}

export const generateMnemonic = (strength: number) => {
  strength = strength || 128;
  const r = strength % 32;
  if (r > 0) {
    throw new Error(
      'Strength should be divisible by 32, but it is not (' + r + ').'
    );
  }
  const buffer = new Uint8Array(strength / 8);
  const data = crypto.getRandomValues(buffer);
  return entropyToMnemonic(data);
};

export const calcBip32ExtendedKey = ({
  mnemonic,
  passphrase,
  derivationPath,
}: {
  mnemonic: string;
  passphrase?: string;
  derivationPath: string;
}) => {
  const seed = mnemonicToSeedSync(mnemonic, passphrase);
  let extendedKey: BIP32Interface = bip32.fromSeed(seed, undefined);

  // Derive the key from the path
  const pathBits = derivationPath.split('/');
  for (let i = 0; i < pathBits.length; i++) {
    const bit = pathBits[i];

    const index = parseInt(bit);
    if (isNaN(index)) {
      continue;
    }

    // eslint-disable-next-line eqeqeq
    const hardened = bit[bit.length - 1] == "'";
    const isPriv = !extendedKey.isNeutered();
    const invalidDerivationPath = hardened && !isPriv;

    if (invalidDerivationPath) {
      extendedKey = null as any;
    } else if (hardened) {
      extendedKey = extendedKey.deriveHardened(index);
    } else {
      extendedKey = extendedKey.derive(index);
    }
  }

  return extendedKey;
};
