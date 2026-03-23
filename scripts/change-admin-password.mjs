const ADMIN_EMAIL = getAdminEmail();
const CURRENT_PASSWORD = process.env.ADMIN_CURRENT_PASSWORD?.trim() ?? "";
const NEW_PASSWORD = process.env.ADMIN_NEW_PASSWORD?.trim() ?? "";

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

function getCookieHeader(headers) {
  if (typeof headers.getSetCookie === "function") {
    return headers
      .getSetCookie()
      .map((value) => value.split(";", 1)[0])
      .join("; ");
  }

  const singleCookie = headers.get("set-cookie");
  return singleCookie ? singleCookie.split(";", 1)[0] : "";
}

function fail(message) {
  console.error(`\n[set:admin-password] ${message}\n`);
  process.exit(1);
}

async function main() {
  if (!ADMIN_EMAIL) {
    fail("Set ADMIN_EMAIL or ADMIN_EMAILS in .env.local before running this script.");
  }

  if (!CURRENT_PASSWORD) {
    fail("Set ADMIN_CURRENT_PASSWORD in .env.local before running this script.");
  }

  if (!NEW_PASSWORD) {
    fail("Set ADMIN_NEW_PASSWORD in .env.local before running this script.");
  }

  if (CURRENT_PASSWORD === NEW_PASSWORD) {
    fail("ADMIN_NEW_PASSWORD must be different from ADMIN_CURRENT_PASSWORD.");
  }

  const adminEmails = getAdminEmails();
  if (!adminEmails.has(ADMIN_EMAIL)) {
    fail(
      `${ADMIN_EMAIL} is not listed in ADMIN_EMAILS. Add it to your env before changing the admin password.`,
    );
  }

  const authBaseUrl = getAuthBaseUrl();
  const signInEndpoint = new URL("/api/auth/sign-in/email", authBaseUrl);
  const changePasswordEndpoint = new URL("/api/auth/change-password", authBaseUrl);

  const signInResponse = await fetch(signInEndpoint, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json",
      origin: signInEndpoint.origin,
      referer: `${signInEndpoint.origin}/`,
    },
    body: JSON.stringify({
      email: ADMIN_EMAIL,
      password: CURRENT_PASSWORD,
      rememberMe: false,
    }),
  });

  const signInContentType = signInResponse.headers.get("content-type") ?? "";
  const signInPayload = signInContentType.includes("application/json")
    ? await signInResponse.json()
    : await signInResponse.text();

  if (!signInResponse.ok) {
    const message =
      typeof signInPayload === "object" && signInPayload !== null
        ? (signInPayload.message ??
          signInPayload.error?.message ??
          JSON.stringify(signInPayload, null, 2))
        : signInPayload;

    fail(
      `Unable to sign in with the current password (${signInResponse.status} ${signInResponse.statusText}): ${message}`,
    );
  }

  const cookieHeader = getCookieHeader(signInResponse.headers);
  if (!cookieHeader) {
    fail("Sign-in succeeded, but no session cookie was returned.");
  }

  const changePasswordResponse = await fetch(changePasswordEndpoint, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json",
      origin: changePasswordEndpoint.origin,
      referer: `${changePasswordEndpoint.origin}/`,
      cookie: cookieHeader,
    },
    body: JSON.stringify({
      currentPassword: CURRENT_PASSWORD,
      newPassword: NEW_PASSWORD,
    }),
  });

  const contentType = changePasswordResponse.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json")
    ? await changePasswordResponse.json()
    : await changePasswordResponse.text();

  if (changePasswordResponse.ok) {
    console.log(
      `[set:admin-password] Updated password for ${ADMIN_EMAIL} via ${changePasswordEndpoint.origin}.`,
    );
    return;
  }

  const message =
    typeof payload === "object" && payload !== null
      ? (payload.message ??
        payload.error?.message ??
        JSON.stringify(payload, null, 2))
      : payload;

  fail(
    `Request failed with ${changePasswordResponse.status} ${changePasswordResponse.statusText}: ${message}`,
  );
}

main().catch((error) => {
  fail(error instanceof Error ? error.message : String(error));
});
