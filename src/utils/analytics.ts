"use client";

import { sendGAEvent } from "@next/third-parties/google";

export function sendEvent(eventName: string, params?: Record<string, unknown>) {
  try {
    sendGAEvent({ event: eventName, ...params });
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[analytics] Failed to send event", error);
    }
  }
}
