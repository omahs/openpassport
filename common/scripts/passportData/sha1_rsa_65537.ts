import { readFileSync, writeFileSync } from "fs";
import { PassportData } from "../../src/utils/types";
import { hash, assembleEContent, formatAndConcatenateDataHashes, formatMrz, hexToDecimal, arraysAreEqual, findSubarrayIndex } from "../../src/utils/utils";
import * as forge from 'node-forge';
import { assert } from "console";
import { mock_dsc_key_sha1_rsa_4096 } from "../../src/constants/mockCertificates";
import { sampleDataHashes_small } from "../../src/constants/sampleDataHashes";

const sampleMRZ = "P<FRADUPONT<<ALPHONSE<HUGUES<ALBERT<<<<<<<<<24HB818324FRA0402111M3111115<<<<<<<<<<<<<<02"
const signatureAlgorithm = 'sha1WithRSAEncryption'
const hashLen = 20

export function genMockPassportData_sha1WithRSAEncryption_65537(): PassportData {
  const mrzHash = hash(signatureAlgorithm, formatMrz(sampleMRZ));
  const concatenatedDataHashes = formatAndConcatenateDataHashes(
    [[1, mrzHash], ...sampleDataHashes_small],
    hashLen,
    31 // could have been different
  );

  const eContent = assembleEContent(hash(signatureAlgorithm, concatenatedDataHashes));

  const privKey = forge.pki.privateKeyFromPem(mock_dsc_key_sha1_rsa_4096);
  const modulus = privKey.n.toString(16);

  const md = forge.md.sha1.create();
  md.update(forge.util.binary.raw.encode(new Uint8Array(eContent)));

  const signature = privKey.sign(md)
  const signatureBytes = Array.from(signature, (c: string) => c.charCodeAt(0));

  return {
    mrz: sampleMRZ,
    signatureAlgorithm: signatureAlgorithm,
    pubKey: {
      modulus: hexToDecimal(modulus),
      exponent: '65537',
    },
    dataGroupHashes: concatenatedDataHashes,
    eContent: eContent,
    encryptedDigest: signatureBytes,
    photoBase64: "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABjElEQVR42mL8//8/AyUYiBQYmIw3..."
  }
}

function verify(passportData: PassportData): boolean {
  const { mrz, signatureAlgorithm, pubKey, dataGroupHashes, eContent, encryptedDigest } = passportData;
  const formattedMrz = formatMrz(mrz);
  const mrzHash = hash(signatureAlgorithm, formattedMrz);
  const dg1HashOffset = findSubarrayIndex(dataGroupHashes, mrzHash)
  console.log('dg1HashOffset', dg1HashOffset);
  assert(dg1HashOffset !== -1, 'MRZ hash index not found in dataGroupHashes');

  const concatHash = hash(signatureAlgorithm, dataGroupHashes)
  assert(
    arraysAreEqual(
      concatHash,
      eContent.slice(eContent.length - concatHash.length)
    ),
    'concatHash is not at the right place in eContent'
  );

  const modulus = new forge.jsbn.BigInteger(pubKey.modulus, 10);
  const exponent = new forge.jsbn.BigInteger(pubKey.exponent, 10);
  const rsaPublicKey = forge.pki.rsa.setPublicKey(modulus, exponent);

  const md = forge.md.sha1.create();
  md.update(forge.util.binary.raw.encode(new Uint8Array(eContent)));

  const signature = Buffer.from(encryptedDigest).toString(
    'binary',
  );

  return rsaPublicKey.verify(md.digest().bytes(), signature);
}

const mockPassportData = genMockPassportData_sha1WithRSAEncryption_65537();
console.log("Passport Data:", JSON.stringify(mockPassportData, null, 2));
console.log("Signature valid:", verify(mockPassportData));

writeFileSync(__dirname + '/passportData.json', JSON.stringify(mockPassportData, null, 2));