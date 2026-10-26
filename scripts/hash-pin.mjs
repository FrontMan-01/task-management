import crypto from "crypto";

const pin = process.argv[2];

if (!pin) {
  console.log("Usage: npm run hash-pin <your-4-to-6-digit-pin>");
  process.exit(1);
}

const salt = crypto.randomBytes(16).toString("hex");
const derivedKey = crypto.scryptSync(pin, salt, 64);
const hash = `${salt}:${derivedKey.toString("hex")}`;

console.log("\n=======================================================");
console.log("🔒 Generated Cryptographic Salted Hash for PIN");
console.log("=======================================================");
console.log(`\nCopy and paste this into your Vercel Environment Variables:`);
console.log(`\nAPP_PIN_HASH="${hash}"\n`);
console.log("This ensures your actual PIN is never stored in plaintext.");
console.log("=======================================================\n");
