import { NextRequest, NextResponse } from "next/server";

// Test endpoint for Google Places API (New)
// Isolated for testing API keys, place IDs, and inspecting the JSON response.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const action = body.action || "getReviews"; // 'getReviews' | 'searchPlace'

    // Extract API key from body or environment variables
    const rawApiKey =
      body.apiKey?.trim() ||
      process.env.GOOGLE_PLACES_API_KEY ||
      process.env.GOOGLE_MAPS_API_KEY ||
      process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY ||
      "";

    const keySource = body.apiKey?.trim()
      ? "user_provided_in_input"
      : process.env.GOOGLE_PLACES_API_KEY
      ? "env:GOOGLE_PLACES_API_KEY"
      : process.env.GOOGLE_MAPS_API_KEY
      ? "env:GOOGLE_MAPS_API_KEY"
      : process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY
      ? "env:NEXT_PUBLIC_GOOGLE_PLACES_API_KEY"
      : "none";

    // Masked key for safe logging / response display
    const maskedKey = rawApiKey
      ? `${rawApiKey.slice(0, 4)}••••••••${rawApiKey.slice(-4)}`
      : null;

    if (!rawApiKey) {
      return NextResponse.json(
        {
          success: false,
          error:
            "No Google Places API key provided. Please enter an API key in the test form or add GOOGLE_PLACES_API_KEY to your .env.local file.",
          keySource,
        },
        { status: 400 }
      );
    }

    // ACTION 1: Search for Place ID by business name / text query
    if (action === "searchPlace") {
      const query = body.query?.trim();
      if (!query) {
        return NextResponse.json(
          {
            success: false,
            error: "Please provide a search query (e.g. 'Jalaram Digital Sign Surat').",
          },
          { status: 400 }
        );
      }

      const searchUrl = "https://places.googleapis.com/v1/places:searchText";
      const fieldMask = [
        "places.id",
        "places.displayName",
        "places.formattedAddress",
        "places.rating",
        "places.userRatingCount",
        "places.googleMapsUri",
      ].join(",");

      const response = await fetch(searchUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": rawApiKey,
          "X-Goog-FieldMask": fieldMask,
        },
        body: JSON.stringify({
          textQuery: query,
          languageCode: body.languageCode || "en",
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        return NextResponse.json(
          {
            success: false,
            httpStatus: response.status,
            error:
              responseData?.error?.message ||
              `Google API returned HTTP status ${response.status}`,
            rawGoogleResponse: responseData,
            keySource,
            maskedKey,
          },
          { status: response.status }
        );
      }

      return NextResponse.json({
        success: true,
        action: "searchPlace",
        keySource,
        maskedKey,
        results: responseData.places || [],
        rawGoogleResponse: responseData,
      });
    }

    // ACTION 2: Fetch Reviews using Place ID
    const placeId =
      body.placeId?.trim() ||
      process.env.GOOGLE_PLACE_ID ||
      process.env.NEXT_PUBLIC_GOOGLE_PLACE_ID ||
      "";

    if (!placeId) {
      return NextResponse.json(
        {
          success: false,
          error:
            "No Place ID provided. Please enter a Google Place ID or use the search feature above to find it.",
          keySource,
          maskedKey,
        },
        { status: 400 }
      );
    }

    // Request Place Details with Reviews from Google Places API (New)
    const placeDetailsUrl = `https://places.googleapis.com/v1/places/${encodeURIComponent(
      placeId
    )}`;

    // Field mask determines what Google returns and bills for
    const fieldMask = [
      "id",
      "displayName",
      "formattedAddress",
      "rating",
      "userRatingCount",
      "reviews",
      "googleMapsUri",
      "websiteUri",
    ].join(",");

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": rawApiKey,
      "X-Goog-FieldMask": fieldMask,
    };

    if (body.languageCode) {
      headers["X-Goog-LanguageCode"] = body.languageCode;
    }

    const response = await fetch(placeDetailsUrl, {
      method: "GET",
      headers,
    });

    const responseData = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          httpStatus: response.status,
          error:
            responseData?.error?.message ||
            `Google Places API returned HTTP ${response.status}`,
          rawGoogleResponse: responseData,
          keySource,
          maskedKey,
          placeId,
          tips: [
            "Ensure 'Places API (New)' is enabled in your Google Cloud Console.",
            "Make sure your API key has permission to use the Places API (New).",
            "If your key has HTTP referrer or IP restrictions, ensure your current request origin is permitted.",
            "Verify that billing is enabled on your Google Cloud Project.",
          ],
        },
        { status: response.status }
      );
    }

    // Format reviews into a clean, ready-to-use structure
    const formattedReviews = (responseData.reviews || []).map(
      (rev: any, index: number) => ({
        id: rev.name || `review-${index}`,
        authorName: rev.authorAttribution?.displayName || "Anonymous",
        authorPhotoUrl: rev.authorAttribution?.photoUri || null,
        authorProfileUrl: rev.authorAttribution?.uri || null,
        rating: rev.rating ?? 5,
        relativeTime: rev.relativePublishTimeDescription || "",
        publishTime: rev.publishTime || "",
        text: rev.text?.text || rev.originalText?.text || "",
        originalLanguage: rev.text?.languageCode || "en",
      })
    );

    return NextResponse.json({
      success: true,
      action: "getReviews",
      keySource,
      maskedKey,
      placeId,
      summary: {
        id: responseData.id,
        name: responseData.displayName?.text || "",
        address: responseData.formattedAddress || "",
        rating: responseData.rating ?? null,
        totalReviews: responseData.userRatingCount ?? 0,
        googleMapsUri: responseData.googleMapsUri || "",
        websiteUri: responseData.websiteUri || "",
        reviewsCount: formattedReviews.length,
      },
      reviews: formattedReviews,
      rawGoogleResponse: responseData,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err?.message || "Internal server error while contacting Google API",
      },
      { status: 500 }
    );
  }
}

// GET handler returns helper information and whether an env key is already present
export async function GET() {
  const hasEnvKey = Boolean(
    process.env.GOOGLE_PLACES_API_KEY ||
      process.env.GOOGLE_MAPS_API_KEY ||
      process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY
  );

  const hasEnvPlaceId = Boolean(
    process.env.GOOGLE_PLACE_ID || process.env.NEXT_PUBLIC_GOOGLE_PLACE_ID
  );

  return NextResponse.json({
    status: "ready",
    message: "Google Places API (New) test endpoint is active.",
    hasEnvApiKeyConfigured: hasEnvKey,
    hasEnvPlaceIdConfigured: hasEnvPlaceId,
    usage: {
      method: "POST",
      endpoint: "/api/test-google-reviews",
      bodyExample: {
        action: "getReviews",
        apiKey: "AIzaSy...",
        placeId: "ChIJ...",
      },
    },
  });
}
