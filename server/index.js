const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;
const secp = require("ethereum-cryptography/secp256k1");

app.use(cors());
app.use(express.json());

const balances = {
  "62e1210d73c53f95dd0343aeb8683cf7330aa830": 100,
  "bed1d2005c768146d1748a48fe0a5e7cb64f43f2": 50,
  "f5df7df7c9720c2930364a33fce3dc86b8888786": 75,
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  const { sender, recipient, amount, messageHash, signedResponse } = req.body;

  setInitialBalance(sender);
  setInitialBalance(recipient);
  const isValid = isValidSender(messageHash, signedResponse, sender);
  if (!isValid) return res.status(400).send({ message: 'Not a valid sender!' });


  if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}

const isValidSender = (messageHash, signedResponse, sender) => {
  const signature = Uint8Array.from(Object.values(signedResponse[0]));
  const publicKey = secp.recoverPublicKey(
    messageHash,
    signature,
    signedResponse[1]
  );
  const isSigned = secp.verify(signature, messageHash, publicKey);

  const isValidSender =
    sender.toString() === getAddressFromPublicKey(publicKey);
  console.log(sender, getAddressFromPublicKey(publicKey));
  if (!isValidSender && isSigned) return false;
  return true;
};

function getAddressFromPublicKey(publicKey) {
  // the first byte indicates whether this is in compressed form or not
  return keccak256(publicKey.slice(1)).slice(-20);
}