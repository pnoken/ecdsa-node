const { keccak256 } = require("ethereum-cryptography/keccak");
const { toHex, utf8ToBytes } = require("ethereum-cryptography/utils");
const secp = require("ethereum-cryptography/secp256k1");

const privateKey = secp.utils.randomPrivateKey();

console.log("private key", toHex(privateKey));

const publicKey = secp.getPublicKey(privateKey);

const signature = await secp.sign(messageHash, privateKey);

const isSigned = secp.verify(signature, messageHash, publicKey);

console.log("pub address", toHex(getAddress(publicKey)));


const a = [1, 2];

a[0] = 10;
a[2] = 20;

console.log('a', a)
function getAddress(publicKey) {
    // the first byte indicates whether this is in compressed form or not
    return keccak256(publicKey.slice(1)).slice(-20);
}

