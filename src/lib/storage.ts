/**
 * Storage utilities for Vercel KV or PostgreSQL
 * Abstracts storage layer so we can switch between KV and DB later
 */

type StorageRecord = {
  emailHash: string;
  email: string; // Keep plain email temporarily for welcome email, then hash
  source: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
};

/**
 * Store signup in Vercel KV
 * Falls back to in-memory storage in development
 * Note: email is kept temporarily for welcome email, then should be removed
 */
export async function storeSignup(data: {
  email: string;
  emailHash: string;
  source: string;
  featureRequest?: string;
  consent: boolean;
}): Promise<void> {
  const record: StorageRecord = {
    emailHash: data.emailHash,
    email: data.email, // Will be removed after email is sent
    source: data.source,
    timestamp: new Date().toISOString(),
    metadata: {
      featureRequest: data.featureRequest || null,
      consent: data.consent,
    },
  };

  // In development, just log
  if (process.env.NODE_ENV === "development") {
    console.log("[Storage] Would store signup:", {
      emailHash: record.emailHash,
      source: record.source,
      timestamp: record.timestamp,
    });
    return;
  }

  // Production: Use Vercel KV REST API (Edge-compatible)
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    try {
      const key = `signup:${record.emailHash}`;
      const url = `${process.env.KV_REST_API_URL}/set/${encodeURIComponent(key)}`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.KV_REST_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          value: record,
          ex: 60 * 60 * 24 * 365, // 1 year TTL
        }),
      });

      if (!response.ok) {
        throw new Error(`KV API error: ${response.statusText}`);
      }
    } catch (error) {
      console.error("[Storage] KV error:", error);
      throw new Error("Failed to store signup");
    }
  } else {
    // Fallback: Could use PostgreSQL here
    console.warn("[Storage] No KV configured, skipping storage");
  }
}

/**
 * Store feedback in Vercel KV
 */
export async function storeFeedback(data: {
  email?: string;
  emailHash?: string;
  feedback: string;
  source: string;
}): Promise<void> {
  const record: StorageRecord = {
    emailHash: data.emailHash || "anonymous",
    email: data.email || "", // Will be removed after processing
    source: data.source,
    timestamp: new Date().toISOString(),
    metadata: {
      feedback: data.feedback,
    },
  };

  // In development, just log
  if (process.env.NODE_ENV === "development") {
    console.log("[Storage] Would store feedback:", {
      emailHash: record.emailHash,
      source: record.source,
      timestamp: record.timestamp,
    });
    return;
  }

  // Production: Use Vercel KV REST API (Edge-compatible)
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    try {
      const key = `feedback:${record.timestamp}:${record.emailHash}`;
      const url = `${process.env.KV_REST_API_URL}/set/${encodeURIComponent(key)}`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.KV_REST_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          value: record,
          ex: 60 * 60 * 24 * 90, // 90 days TTL
        }),
      });

      if (!response.ok) {
        throw new Error(`KV API error: ${response.statusText}`);
      }
    } catch (error) {
      console.error("[Storage] KV error:", error);
      throw new Error("Failed to store feedback");
    }
  } else {
    console.warn("[Storage] No KV configured, skipping storage");
  }
}

/**
 * Check if email already exists (by hash)
 */
export async function emailExists(emailHash: string): Promise<boolean> {
  if (process.env.NODE_ENV === "development") {
    return false; // Always allow in dev
  }

  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    try {
      const key = `signup:${emailHash}`;
      const url = `${process.env.KV_REST_API_URL}/get/${encodeURIComponent(key)}`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${process.env.KV_REST_API_TOKEN}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data.result != null;
      }
      return false;
    } catch (error) {
      console.error("[Storage] KV error:", error);
      return false; // Fail open
    }
  }

  return false;
}

