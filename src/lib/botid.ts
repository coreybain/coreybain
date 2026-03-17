export const CONTACT_SUBMIT_API_PATH = "/api/contact/submit";
export const ADMIN_SIGN_IN_API_PATH = "/api/auth/sign-in/email";

export const BOT_ID_CHECK_LEVEL = "basic" as const;

export const botIdProtectedRoutes = [
  {
    path: CONTACT_SUBMIT_API_PATH,
    method: "POST",
    advancedOptions: {
      checkLevel: BOT_ID_CHECK_LEVEL,
    },
  },
  {
    path: ADMIN_SIGN_IN_API_PATH,
    method: "POST",
    advancedOptions: {
      checkLevel: BOT_ID_CHECK_LEVEL,
    },
  },
];

export const CONTACT_BOT_BLOCK_MESSAGE =
  "That inquiry was blocked by bot protection. Please try again from a normal browser session.";

export const AUTH_BOT_BLOCK_MESSAGE =
  "This sign-in attempt was blocked by bot protection. Please try again from a normal browser session.";
