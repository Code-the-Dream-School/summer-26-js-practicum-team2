const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

const sendEmail = async ({ to, subject, text, html }) => {
  const apiKey = process.env.BREVO_API_KEY;
  const fromEmail = process.env.FROM_EMAIL;
  const fromName = process.env.FROM_NAME;

  // Make sure the required environment variables exist.
  if (!apiKey) {
    const error = new Error("Missing BREVO_API_KEY.");
    error.code = "BREVO_CONFIG";
    throw error;
  }

  if (!fromEmail) {
    const error = new Error("Missing FROM_EMAIL for Brevo sender.");
    error.code = "BREVO_CONFIG";
    throw error;
  }

  // Brevo uses fetch, which is built into Node 18+.
  if (typeof fetch !== "function") {
    const error = new Error(
      "Global fetch is unavailable. Use Node 18+ runtime.",
    );
    error.code = "BREVO_FETCH_UNAVAILABLE";
    throw error;
  }

  // Use the normal Brevo URL unless a custom one is provided.
  let apiUrl = process.env.BREVO_API_URL || BREVO_API_URL;

  try {
    const url = new URL(apiUrl);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      throw new Error("Unsupported protocol");
    }

    apiUrl = url.toString();
  } catch {
    console.warn(
      `Invalid BREVO_API_URL "${apiUrl}". Using the default Brevo endpoint.`,
    );

    apiUrl = BREVO_API_URL;
  }

  // The sender name is optional.
  const sender = {
    email: fromEmail,
  };

  if (fromName) {
    sender.name = fromName;
  }

  // Format the email the way Brevo expects it.
  const payload = {
    sender,
    to: [{ email: to }],
    subject,
    textContent: text,
    htmlContent: html,
  };

  // Cancel the request if Brevo does not respond within 10 seconds.
  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, 10000);

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!response.ok) {
      const responseBody = await response.text();

      const error = new Error(
        `Brevo API request failed with status ${response.status}: ${responseBody}`,
      );

      error.code = `BREVO_HTTP_${response.status}`;
      throw error;
    }

    const data = await response.json();

    return {
      messageId: data.messageId || "brevo-accepted",
      accepted: [to],
      rejected: [],
    };
  } catch (error) {
    if (error.name === "AbortError") {
      const timeoutError = new Error(
        "Brevo API request timed out after 10 seconds.",
      );

      timeoutError.code = "BREVO_TIMEOUT";
      throw timeoutError;
    }

    if (error instanceof TypeError) {
      const networkError = new Error("Brevo API is unreachable.");

      networkError.code = "BREVO_UNREACHABLE";
      throw networkError;
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
};

const sendVerificationEmail = (to, subject, text, html) => {
  return sendEmail({ to, subject, text, html });
};

module.exports = {
  sendEmail,
  sendVerificationEmail,
};