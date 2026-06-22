const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/waitlist") {
      return handleWaitlist(request, env);
    }
    return env.ASSETS.fetch(request);
  }
};

async function handleWaitlist(request, env) {
  if (request.method === "OPTIONS") {
    return json({ ok: true });
  }
  if (request.method !== "POST") {
    return json({ ok: false, error: "Method not allowed." }, 405);
  }
  if (!env.WAITLIST) {
    return json({ ok: false, error: "Waitlist storage is unavailable." }, 503);
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return json({ ok: false, error: "Invalid JSON." }, 400);
  }

  const email = String(payload.email || "").trim().toLowerCase();
  if (!emailPattern.test(email) || email.length > 254) {
    return json({ ok: false, error: "Invalid email." }, 400);
  }

  await env.WAITLIST.put(`email:${email}`, JSON.stringify({
    email,
    createdAt: new Date().toISOString(),
    source: "tuckio.com"
  }));

  return json({ ok: true });
}

function json(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}
