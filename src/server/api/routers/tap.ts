import { clerkClient } from "@clerk/nextjs/server";
import { env } from "~/env";

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
        const match = phoneWithoutPlus.match(/^(\d{1,3})(\d+)$/);
        if (match && match[1] && match[2]) {
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
        Authorization: `Bearer ${env.TEST_SECRET_KEY}`,
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
): Promise<string> {
  try {
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
        url: "https://webhook.site/48c244ea-3a61-4d9f-81e9-28292b638860",
      },
      redirect: {
        url: "http://localhost:3000/dashboard",
      },
    };

    // Make API call to Tap
    const response = await fetch("https://api.tap.company/v2/charges/", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.TEST_SECRET_KEY}`,
        accept: "application/json",
        "content-type": "application/json",
        lang_code: langCode,
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
