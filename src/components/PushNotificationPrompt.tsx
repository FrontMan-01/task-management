"use client";

import { useState, useEffect } from "react";
import { Bell, BellOff, CheckCircle2, AlertCircle } from "lucide-react";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function PushNotificationPrompt() {
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusMessage, setStatusMessage] = useState<string>("");

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      "Notification" in window
    ) {
      setIsSupported(true);
      checkExistingSubscription();
    } else {
      setIsSupported(false);
      setLoading(false);
    }
  }, []);

  async function checkExistingSubscription() {
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      setIsSubscribed(Boolean(sub));
    } catch (err) {
      console.warn("Error checking push subscription:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleTogglePush() {
    if (!isSupported) return;
    setLoading(true);
    setStatusMessage("");

    try {
      if (isSubscribed) {
        // Unsubscribe
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        if (sub) {
          await fetch("/api/push/subscribe", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ endpoint: sub.endpoint }),
          });
          await sub.unsubscribe();
        }
        setIsSubscribed(false);
        setStatusMessage("Notifications disabled.");
      } else {
        // Subscribe
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          setStatusMessage("Notification permission was denied.");
          setLoading(false);
          return;
        }

        // Get VAPID public key
        const keyRes = await fetch("/api/push/subscribe");
        if (!keyRes.ok) throw new Error("Could not retrieve VAPID public key");
        const { publicKey } = await keyRes.json();

        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        });

        // Save to database
        const saveRes = await fetch("/api/push/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subscription: sub.toJSON() }),
        });

        if (saveRes.ok) {
          setIsSubscribed(true);
          setStatusMessage("Push notifications successfully enabled!");
        } else {
          throw new Error("Failed to save subscription");
        }
      }
    } catch (err: any) {
      console.error("Push notification toggle error:", err);
      setStatusMessage(err?.message || "Failed to update notification settings");
    } finally {
      setLoading(false);
    }
  }

  if (!isSupported) {
    return (
      <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-950/60 text-xs text-zinc-500 flex items-center gap-2">
        <BellOff className="w-4 h-4 shrink-0 text-zinc-600" />
        <span>Web Push not supported on this device/browser. Add to Home Screen first on iOS.</span>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-xl border border-zinc-800 bg-[#0c0c10] shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-zinc-800 text-zinc-200">
            {isSubscribed ? (
              <Bell className="w-4 h-4 text-emerald-400" />
            ) : (
              <BellOff className="w-4 h-4 text-zinc-400" />
            )}
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Web Push Notifications
            </h4>
            <p className="text-[11px] text-zinc-400">
              Evening pending checks & Sunday morning catch-up nudges
            </p>
          </div>
        </div>

        <button
          onClick={handleTogglePush}
          disabled={loading}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all active:scale-95 disabled:opacity-50 ${
            isSubscribed
              ? "bg-emerald-950 border border-emerald-800/80 text-emerald-300 hover:bg-emerald-900"
              : "bg-red-500 hover:bg-red-600 text-white font-bold"
          }`}
        >
          {loading ? "..." : isSubscribed ? "Enabled" : "Enable"}
        </button>
      </div>

      {statusMessage && (
        <div className="text-[11px] flex items-center gap-1.5 text-zinc-300 font-mono bg-zinc-900/80 p-2 rounded-lg">
          {isSubscribed ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          )}
          <span>{statusMessage}</span>
        </div>
      )}
    </div>
  );
}
