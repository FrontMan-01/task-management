import { NextRequest, NextResponse } from "next/server";
import { getVapidKeys, saveSubscription, deleteSubscription } from "@/lib/push";

export async function GET() {
  try {
    const keys = await getVapidKeys();
    return NextResponse.json({ publicKey: keys.publicKey });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to get VAPID public key", details: err.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { subscription } = body;

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return NextResponse.json(
        { error: "Invalid subscription payload" },
        { status: 400 }
      );
    }

    await saveSubscription(subscription);
    return NextResponse.json({ success: true, message: "Subscription saved" });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to save subscription", details: err.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { endpoint } = body;
    if (endpoint) {
      await deleteSubscription(endpoint);
    }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to delete subscription", details: err.message },
      { status: 500 }
    );
  }
}
