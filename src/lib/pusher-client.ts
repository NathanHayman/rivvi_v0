"use client";

import PusherClient from "pusher-js";

if (!process.env.NEXT_PUBLIC_PUSHER_KEY) {
  throw new Error("NEXT_PUBLIC_PUSHER_KEY is required");
}

if (!process.env.NEXT_PUBLIC_PUSHER_CLUSTER) {
  throw new Error("NEXT_PUBLIC_PUSHER_CLUSTER is required");
}

export const pusherClient = new PusherClient(
  process.env.NEXT_PUBLIC_PUSHER_KEY,
  {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
  }
);
