import webpush from "web-push";
import { query, initDatabase } from "./db";

export interface PushSubscriptionPayload {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

/**
 * Retrieves the fixed VAPID keys from environment variables.
 * Never dynamically regenerated across deployments to preserve existing client subscriptions.
 */
export function getVapidKeys(): { publicKey: string; privateKey: string } {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;

  if (!publicKey || !privateKey) {
    throw new Error(
      "Fixed VAPID keys are missing from environment variables. " +
      "Set NEXT_PUBLIC_VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY in your .env or Vercel dashboard."
    );
  }

  return { publicKey, privateKey };
}

export async function saveSubscription(sub: PushSubscriptionPayload) {
  await initDatabase();
  const { endpoint, keys } = sub;
  await query(
    `INSERT INTO push_subscriptions (endpoint, p256dh, auth)
     VALUES ($1, $2, $3)
     ON CONFLICT (endpoint) DO UPDATE SET p256dh = $2, auth = $3`,
    [endpoint, keys.p256dh, keys.auth]
  );
}

export async function deleteSubscription(endpoint: string) {
  await initDatabase();
  await query(`DELETE FROM push_subscriptions WHERE endpoint = $1`, [endpoint]);
}

export async function sendNotificationToAll(payload: {
  title: string;
  body: string;
  url?: string;
}) {
  await initDatabase();
  const vapidKeys = getVapidKeys();
  const subject = process.env.VAPID_SUBJECT || "mailto:do-or-die@tasktracker.internal";

  webpush.setVapidDetails(subject, vapidKeys.publicKey, vapidKeys.privateKey);

  const subRes = await query(`SELECT * FROM push_subscriptions`);
  const results = [];

  for (const row of subRes.rows) {
    const pushSubscription = {
      endpoint: row.endpoint,
      keys: {
        p256dh: row.p256dh,
        auth: row.auth,
      },
    };

    try {
      await webpush.sendNotification(
        pushSubscription,
        JSON.stringify(payload)
      );
      results.push({ endpoint: row.endpoint, status: "sent" });
    } catch (err: any) {
      console.warn("Failed to send push to", row.endpoint, err?.statusCode);
      if (err?.statusCode === 404 || err?.statusCode === 410) {
        // Subscription expired or unregistered on device
        await deleteSubscription(row.endpoint);
      }
      results.push({ endpoint: row.endpoint, status: "failed", error: err?.message });
    }
  }

  return results;
}
