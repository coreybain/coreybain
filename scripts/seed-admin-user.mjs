const ADMIN_EMAIL = getAdminEmail();
const ADMIN_NAME = process.env.ADMIN_NAME?.trim() || "Admin User";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD?.trim() ?? "";

function getAuthBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_CONVEX_SITE_URL ??
    process.env.CONVEX_SITE_URL ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.SITE_URL ??
    "http://localhost:3000"
  );
}

function getAdminEmails() {
  return new Set(
    (process.env.ADMIN_EMAILS ?? "")
      .split(",")
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean),
  );
}

function getAdminEmail() {
  const explicit = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (explicit) {
    return explicit;
  }

  const [firstAdminEmail] = [...getAdminEmails()];
  return firstAdminEmail ?? "";
}

function fail(message) {
  console.error(`\n[seed:admin] ${message}\n`);
  process.exit(1);
}

async function main() {
  if (!ADMIN_EMAIL) {
    fail("Set ADMIN_EMAIL or ADMIN_EMAILS in .env.local before running this script.");
  }

  if (!ADMIN_PASSWORD) {
    fail("Set ADMIN_PASSWORD in .env.local before running this script.");
  }

  const adminEmails = getAdminEmails();

  if (!adminEmails.has(ADMIN_EMAIL)) {
    fail(
      `${ADMIN_EMAIL} is not listed in ADMIN_EMAILS. Add it to your env before seeding the admin account.`,
    );
  }

  const authBaseUrl = getAuthBaseUrl();
  const endpoint = new URL("/api/auth/sign-up/email", authBaseUrl);

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json",
      origin: endpoint.origin,
      referer: `${endpoint.origin}/`,
    },
    body: JSON.stringify({
      email: ADMIN_EMAIL,
      name: ADMIN_NAME,
      password: ADMIN_PASSWORD,
    }),
  });

  const contentType = response.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (response.ok) {
    console.log(
      `[seed:admin] Created admin user ${ADMIN_EMAIL} via ${endpoint.origin}.`,
    );
    return;
  }

  const message =
    typeof payload === "object" && payload !== null
      ? (payload.message ??
        payload.error?.message ??
        JSON.stringify(payload, null, 2))
      : payload;

  if (response.status === 422) {
    fail(`Admin user already exists for ${ADMIN_EMAIL}. ${message}`);
  }

  fail(
    `Request failed with ${response.status} ${response.statusText}: ${message}`,
  );
}

main().catch((error) => {
  fail(error instanceof Error ? error.message : String(error));
});
