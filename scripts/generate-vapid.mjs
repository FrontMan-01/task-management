import webpush from "web-push";

const vapidKeys = webpush.generateVAPIDKeys();

console.log("\n=======================================================");
console.log("🔔 Fresh Web Push VAPID Keypair Generated");
console.log("=======================================================");
console.log("\nAdd these ONLY to your local gitignored .env.local file and");
console.log("to your Vercel Environment Variables dashboard.");
console.log("NEVER commit the private key to GitHub or put it in .env.example!\n");
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY="${vapidKeys.publicKey}"`);
console.log(`VAPID_PRIVATE_KEY="${vapidKeys.privateKey}"\n`);
console.log("=======================================================\n");
