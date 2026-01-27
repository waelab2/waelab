import { clerkClient } from "@clerk/nextjs/server";
import { env } from "~/env";

/**
 * Get the Tap secret key to use.
 * Priority: TAP_SECRET_KEY > TEST_SECRET_KEY > LIVE_SECRET_KEY
 * This allows easy swapping without code changes - just set TAP_SECRET_KEY to override.
 */
function getTapSecretKey(): string {
  if (env.TAP_SECRET_KEY) {
    return env.TAP_SECRET_KEY;
  }
  if (env.TEST_SECRET_KEY) {
    return env.TEST_SECRET_KEY;
  }
  if (env.LIVE_SECRET_KEY) {
    return env.LIVE_SECRET_KEY;
  }
  throw new Error(
    "No Tap secret key configured. Set TAP_SECRET_KEY, TEST_SECRET_KEY, or LIVE_SECRET_KEY",
  );
}

interface TapPhone {
  country_code: string;
  number: string;
}

interface TapCreateCustomerRequest {
  first_name: string;
  middle_name?: string;
  last_name?: string;
  email?: string;
  phone?: TapPhone;
}

interface TapCreateCustomerResponse {
  id: string;
  object: string;
  created: number;
  first_name: string;
  middle_name?: string;
  last_name?: string;
  email?: string;
  phone?: TapPhone;
  [key: string]: unknown;
}

export interface CreateTapCustomerResult {
  success: true;
  customer: TapCreateCustomerResponse;
}

/**
 * Shared helper function to create a Tap customer for a given user ID.
 * This can be called from anywhere on the server side.
 */
export async function createTapCustomer(
  userId: string,
): Promise<CreateTapCustomerResult> {
  try {
    // Verify Tap secret key is configured
    getTapSecretKey(); // Will throw if not configured
    // Get user from Clerk
    const client = await clerkClient();
    const user = await client.users.getUser(userId);

    // Extract first name (required)
    const firstName = user.firstName;
    if (!firstName) {
      throw new Error(
        "First name is required but not found in user profile. Please update your profile.",
      );
    }

    // Build the request payload
    const payload: TapCreateCustomerRequest = {
      first_name: firstName,
    };

    // Add optional fields if available
    if (user.lastName) {
      payload.last_name = user.lastName;
    }

    // Get primary email address
    const primaryEmail =
      user.emailAddresses.find(
        (email) => email.id === user.primaryEmailAddressId,
      )?.emailAddress ?? user.emailAddresses[0]?.emailAddress;

    if (primaryEmail) {
      payload.email = primaryEmail;
    }

    // Get phone number if available (Clerk User type may have phoneNumbers)
    const phoneNumbers = (
      user as { phoneNumbers?: Array<{ id: string; phoneNumber: string }> }
    ).phoneNumbers;
    const primaryPhoneNumberId = (user as { primaryPhoneNumberId?: string })
      .primaryPhoneNumberId;

    if (phoneNumbers && phoneNumbers.length > 0) {
      const primaryPhone =
        phoneNumbers.find((phone) => phone.id === primaryPhoneNumberId)
          ?.phoneNumber ?? phoneNumbers[0]?.phoneNumber;

      if (primaryPhone) {
        // Extract country code and number from phone number
        // Phone format could be: +965512345678 or 965512345678
        const phoneWithoutPlus = primaryPhone.replace(/^\+/, "");
        // Try to extract country code (assuming 1-3 digits) and number
        // This is a simple approach - you might need to adjust based on your phone number format
        const phoneRegex = /^(\d{1,3})(\d+)$/;
        const match = phoneRegex.exec(phoneWithoutPlus);
        if (match?.[1] && match?.[2]) {
          payload.phone = {
            country_code: match[1],
            number: match[2],
          };
        }
      }
    }

    // Make API call to Tap
    const response = await fetch("https://api.tap.company/v2/customers/", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getTapSecretKey()}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = (await response.json().catch(() => ({}))) as {
        errors?: Array<{ message?: string }>;
        message?: string;
      };

      const errorMessage =
        errorData.errors?.[0]?.message ??
        errorData.message ??
        `Tap API error: ${response.status} ${response.statusText}`;

      throw new Error(errorMessage);
    }

    const data = (await response.json()) as TapCreateCustomerResponse;

    return {
      success: true,
      customer: data,
    };
  } catch (error) {
    console.error("Error creating Tap customer:", error);

    throw error instanceof Error
      ? error
      : new Error("Failed to create Tap customer");
  }
}

interface TapCreateChargeRequest {
  amount: number;
  currency: string;
  receipt: {
    email: boolean;
    sms: boolean;
  };
  customer: {
    id: string;
  };
  merchant: {
    id: string;
  };
  source: {
    id: string;
  };
  post: {
    url: string;
  };
  redirect: {
    url: string;
  };
  save_card?: boolean;
  payment_agreement?: {
    type?: string;
  };
  metadata?: Record<string, unknown>;
}

interface TapPaymentAgreement {
  id: string;
  total_payments_count?: number;
  contract?: {
    id: string;
    type: string;
  };
  variable_amount?: {
    id: string;
  };
}

interface TapCreateChargeResponse {
  id: string;
  object: string;
  live_mode: boolean;
  customer_initiated: boolean;
  api_version: string;
  method: string;
  status: string;
  amount: number;
  currency: string;
  threeDSecure: boolean;
  card_threeDSecure: boolean;
  save_card: boolean;
  product: string;
  order: Record<string, unknown>;
  transaction: {
    timezone: string;
    created: string;
    url: string;
    expiry: {
      period: number;
      type: string;
    };
    asynchronous: boolean;
    amount: number;
    currency: string;
    date: {
      created: number;
      transaction: number;
    };
  };
  response: {
    code: string;
    message: string;
  };
  receipt: {
    email: boolean;
    sms: boolean;
  };
  customer: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  merchant: {
    country: string;
    currency: string;
    id: string;
  };
  source: {
    object: string;
    type: string;
    payment_type: string;
    channel: string;
    id: string;
    on_file: boolean;
    payment_method: string;
  };
  redirect: {
    status: string;
    url: string;
  };
  post: {
    status: string;
    url: string;
  };
  activities: Array<{
    id: string;
    object: string;
    created: number;
    status: string;
    currency: string;
    amount: number;
    remarks: string;
    txn_id: string;
  }>;
  auto_reversed: boolean;
  intent: {
    id: string;
  };
  initiator: string;
  payment_agreement?: TapPaymentAgreement;
}

/**
 * Shared helper function to create a Tap charge.
 * This can be called from anywhere on the server side.
 * Returns the transaction URL for redirecting the user to the payment page.
 */
export async function createCharge(
  tapCustomerId: string,
  amount: number,
  langCode: string,
  options?: {
    saveCard?: boolean;
    agreementType?: string;
    metadata?: Record<string, unknown>;
    webhookUrl?: string;
  },
): Promise<string> {
  try {
    // Verify Tap secret key is configured
    getTapSecretKey(); // Will throw if not configured
    // Use environment variable for webhook URL or fallback to default
    const webhookUrl =
      options?.webhookUrl ??
      process.env.TAP_WEBHOOK_URL ??
      "https://webhook.site/48c244ea-3a61-4d9f-81e9-28292b638860";

    const payload: TapCreateChargeRequest = {
      amount,
      currency: "SAR",
      receipt: {
        email: false,
        sms: false,
      },
      customer: {
        id: tapCustomerId,
      },
      merchant: {
        id: "68000512",
      },
      source: {
        id: "src_all",
      },
      post: {
        url: webhookUrl,
      },
      redirect: {
        url: "http://localhost:3000/dashboard",
      },
    };

    // Add save_card if requested (for payment agreements)
    // Note: For initial charges, just set save_card: true
    // Tap will automatically create the payment agreement
    // payment_agreement field is only used for subsequent recurring charges
    if (options?.saveCard === true) {
      payload.save_card = true;
      // Don't include payment_agreement in initial charge - Tap creates it automatically
      // payment_agreement.id is only needed for subsequent merchant-initiated charges
    }

    // Add metadata if provided
    if (options?.metadata) {
      payload.metadata = options.metadata;
    }

    // Log payload for debugging (remove sensitive data in production)
    console.log("Creating Tap charge with payload:", {
      ...payload,
      customer: { id: payload.customer.id },
      // Don't log full secret key
    });

    // Make API call to Tap
    const response = await fetch("https://api.tap.company/v2/charges/", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getTapSecretKey()}`,
        accept: "application/json",
        "content-type": "application/json",
        lang_code: langCode,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData: {
        errors?: Array<{ message?: string; code?: string; field?: string }>;
        message?: string;
      };
      
      try {
        errorData = JSON.parse(errorText) as {
          errors?: Array<{ message?: string; code?: string; field?: string }>;
          message?: string;
        };
      } catch {
        errorData = { message: errorText };
      }

      // Log full error details for debugging
      console.error("Tap API error response:", {
        status: response.status,
        statusText: response.statusText,
        errorText,
        errorData: JSON.stringify(errorData, null, 2),
        errors: errorData.errors,
        payload: {
          ...payload,
          customer: { id: payload.customer.id },
        },
      });

      const errorMessage =
        errorData.errors?.[0]?.message ??
        errorData.message ??
        `Tap API error: ${response.status} ${response.statusText}`;

      // Include error code and field if available
      const errorCode = errorData.errors?.[0]?.code;
      const errorField = errorData.errors?.[0]?.field;
      
      // Provide helpful error message for common error codes
      let fullErrorMessage = errorMessage;
      if (errorCode === "1108") {
        fullErrorMessage = `Save Card feature is not enabled on your Tap merchant account. Please contact your Tap account manager to enable the "Save Card" feature. Original error: ${errorMessage}`;
      } else if (errorCode || errorField) {
        fullErrorMessage = `${errorMessage} (Code: ${errorCode}${errorField ? `, Field: ${errorField}` : ""})`;
      }

      throw new Error(fullErrorMessage);
    }

    const data = (await response.json()) as TapCreateChargeResponse;

    // Extract and return the transaction URL
    const transactionUrl = data.transaction?.url;
    if (!transactionUrl) {
      throw new Error("Transaction URL not found in charge response");
    }

    return transactionUrl;
  } catch (error) {
    console.error("Error creating Tap charge:", error);

    throw error instanceof Error
      ? error
      : new Error("Failed to create Tap charge");
  }
}

interface TapGenerateTokenRequest {
  customer: {
    id: string;
  };
  card?: {
    id: string;
  };
}

interface TapGenerateTokenResponse {
  id: string;
  object: string;
  card: {
    id: string;
    object: string;
    first_six: string;
    last_four: string;
    brand: string;
    expiry: {
      month: number;
      year: number;
    };
  };
  customer: {
    id: string;
  };
  created: number;
  expiry: number;
  [key: string]: unknown;
}

/**
 * Generate a one-time token from a saved card for recurring charges.
 * Tokens expire after ~5 minutes and are single-use only.
 */
export async function generateToken(
  tapCustomerId: string,
  cardId?: string,
): Promise<string> {
  try {
    const payload: TapGenerateTokenRequest = {
      customer: {
        id: tapCustomerId,
      },
    };

    // Include card ID if provided
    if (cardId) {
      payload.card = {
        id: cardId,
      };
    }

    const response = await fetch("https://api.tap.company/v2/tokens/", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getTapSecretKey()}`,
        accept: "application/json",
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = (await response.json().catch(() => ({}))) as {
        errors?: Array<{ message?: string }>;
        message?: string;
      };

      const errorMessage =
        errorData.errors?.[0]?.message ??
        errorData.message ??
        `Tap API error: ${response.status} ${response.statusText}`;

      throw new Error(errorMessage);
    }

    const data = (await response.json()) as TapGenerateTokenResponse;

    return data.id;
  } catch (error) {
    console.error("Error generating Tap token:", error);

    throw error instanceof Error
      ? error
      : new Error("Failed to generate Tap token");
  }
}

interface TapCreateRecurringChargeRequest {
  amount: number;
  currency: string;
  customer_initiated: boolean;
  save_card: boolean;
  payment_agreement: {
    id: string;
  };
  customer: {
    id: string;
  };
  source: {
    id: string;
  };
  description?: string;
  metadata?: Record<string, unknown>;
  receipt: {
    email: boolean;
    sms: boolean;
  };
}

interface TapCreateRecurringChargeResponse {
  id: string;
  object: string;
  status: string;
  amount: number;
  currency: string;
  customer: {
    id: string;
  };
  payment_agreement: {
    id: string;
  };
  [key: string]: unknown;
}

/**
 * Create a recurring charge using a payment agreement.
 * This is a merchant-initiated charge that doesn't require customer interaction.
 */
export async function createRecurringCharge(
  paymentAgreementId: string,
  tapCustomerId: string,
  amount: number,
  currency: string,
  options?: {
    description?: string;
    metadata?: Record<string, unknown>;
    cardId?: string;
  },
): Promise<TapCreateRecurringChargeResponse> {
  try {
    // Generate fresh token for this charge
    const tokenId = await generateToken(tapCustomerId, options?.cardId);

    const payload: TapCreateRecurringChargeRequest = {
      amount,
      currency,
      customer_initiated: false, // Merchant-initiated charge
      save_card: false, // Card already saved
      payment_agreement: {
        id: paymentAgreementId,
      },
      customer: {
        id: tapCustomerId,
      },
      source: {
        id: tokenId, // Use the generated token
      },
      receipt: {
        email: false,
        sms: false,
      },
    };

    if (options?.description) {
      payload.description = options.description;
    }

    if (options?.metadata) {
      payload.metadata = options.metadata;
    }

    const response = await fetch("https://api.tap.company/v2/charges/", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getTapSecretKey()}`,
        accept: "application/json",
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = (await response.json().catch(() => ({}))) as {
        errors?: Array<{ message?: string }>;
        message?: string;
      };

      const errorMessage =
        errorData.errors?.[0]?.message ??
        errorData.message ??
        `Tap API error: ${response.status} ${response.statusText}`;

      throw new Error(errorMessage);
    }

    const data = (await response.json()) as TapCreateRecurringChargeResponse;

    return data;
  } catch (error) {
    console.error("Error creating recurring Tap charge:", error);

    throw error instanceof Error
      ? error
      : new Error("Failed to create recurring Tap charge");
  }
}
