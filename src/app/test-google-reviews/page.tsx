"use client";

import { useState, useEffect } from "react";
import {
  Star,
  Search,
  KeyRound,
  MapPin,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Info,
  Code2,
  Eye,
  EyeOff,
  Sparkles,
  MessageSquare,
  Building,
  HelpCircle,
} from "lucide-react";

interface ReviewItem {
  id: string;
  authorName: string;
  authorPhotoUrl: string | null;
  authorProfileUrl: string | null;
  rating: number;
  relativeTime: string;
  publishTime: string;
  text: string;
  originalLanguage: string;
}

interface PlaceSummary {
  id: string;
  name: string;
  address: string;
  rating: number | null;
  totalReviews: number;
  googleMapsUri: string;
  websiteUri: string;
  reviewsCount: number;
}

interface SearchPlaceResult {
  id: string;
  displayName?: { text: string };
  formattedAddress?: string;
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
}

export default function TestGoogleReviewsPage() {
  const [apiKey, setApiKey] = useState("AIzaSyAol-RWKfijVpfoHFLZwtJBAl7tEDWzzps");
  const [showApiKey, setShowApiKey] = useState(false);
  const [placeId, setPlaceId] = useState("");
  const [searchQuery, setSearchQuery] = useState("Jalaram Digital Sign");

  // Status checks from server
  const [serverStatus, setServerStatus] = useState<{
    checked: boolean;
    hasEnvApiKey: boolean;
    hasEnvPlaceId: boolean;
  }>({
    checked: false,
    hasEnvApiKey: false,
    hasEnvPlaceId: false,
  });

  // State
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchPlaceResult[]>([]);
  const [summary, setSummary] = useState<PlaceSummary | null>(null);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [rawResponse, setRawResponse] = useState<any>(null);
  const [errorDetails, setErrorDetails] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"formatted" | "raw" | "docs">("formatted");
  const [copied, setCopied] = useState(false);

  // Check backend endpoint on load
  useEffect(() => {
    fetch("/api/test-google-reviews")
      .then((res) => res.json())
      .then((data) => {
        setServerStatus({
          checked: true,
          hasEnvApiKey: Boolean(data.hasEnvApiKeyConfigured),
          hasEnvPlaceId: Boolean(data.hasEnvPlaceIdConfigured),
        });
      })
      .catch(() => {
        setServerStatus({
          checked: true,
          hasEnvApiKey: false,
          hasEnvPlaceId: false,
        });
      });
  }, []);

  // Handler: Search Place ID
  const handleSearchPlace = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearchLoading(true);
    setErrorDetails(null);

    try {
      const res = await fetch("/api/test-google-reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "searchPlace",
          query: searchQuery,
          apiKey: apiKey.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorDetails(data);
        setSearchResults([]);
      } else {
        setSearchResults(data.results || []);
        setRawResponse(data.rawGoogleResponse);
      }
    } catch (err: any) {
      setErrorDetails({
        error: err?.message || "Failed to contact local API endpoint.",
      });
    } finally {
      setSearchLoading(false);
    }
  };

  // Handler: Fetch Reviews
  const handleFetchReviews = async (customPlaceId?: string) => {
    const targetPlaceId = customPlaceId || placeId;
    setLoading(true);
    setErrorDetails(null);

    try {
      const res = await fetch("/api/test-google-reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "getReviews",
          placeId: targetPlaceId.trim() || undefined,
          apiKey: apiKey.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorDetails(data);
        setSummary(null);
        setReviews([]);
        setRawResponse(data.rawGoogleResponse || data);
      } else {
        setSummary(data.summary);
        setReviews(data.reviews || []);
        setRawResponse(data.rawGoogleResponse);
        if (targetPlaceId) {
          setPlaceId(targetPlaceId);
        }
      }
    } catch (err: any) {
      setErrorDetails({
        error: err?.message || "Network error while calling test endpoint",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyJson = () => {
    if (!rawResponse) return;
    navigator.clipboard.writeText(JSON.stringify(rawResponse, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${star <= Math.round(rating)
              ? "text-amber-400 fill-amber-400"
              : "text-zinc-300 dark:text-zinc-600"
              }`}
          />
        ))}
        <span className="ml-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          {rating?.toFixed ? rating.toFixed(1) : rating}
        </span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Banner */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 mb-3">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Isolated Sandbox &bull; Zero Impact on Main Code & DB
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                Google Places API (New) Reviews Test Page
              </h1>
              <p className="mt-2 text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-3xl">
                Test and inspect real Google Places API (New) responses before integrating them into
                your main website. Enter your API key below or read it securely from{" "}
                <code className="text-xs bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded font-mono">
                  .env.local
                </code>
                .
              </p>
            </div>

            {serverStatus.checked && (
              <div className="bg-zinc-100 dark:bg-zinc-800/70 border border-zinc-200 dark:border-zinc-700/60 rounded-xl p-3 text-xs space-y-1">
                <div className="font-semibold text-zinc-700 dark:text-zinc-300">
                  Server Env Detection:
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${serverStatus.hasEnvApiKey ? "bg-emerald-500" : "bg-amber-500"
                      }`}
                  />
                  <span>
                    API Key:{" "}
                    <strong>
                      {serverStatus.hasEnvApiKey ? "Present in .env" : "Not set in .env"}
                    </strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${serverStatus.hasEnvPlaceId ? "bg-emerald-500" : "bg-zinc-400"
                      }`}
                  />
                  <span>
                    Place ID:{" "}
                    <strong>
                      {serverStatus.hasEnvPlaceId ? "Present in .env" : "Optional"}
                    </strong>
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Input Configuration Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Controls Card */}
          <div className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-6">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
              <KeyRound className="w-5 h-5 text-indigo-500" />
              1. Credentials &amp; Target Place
            </h2>

            {/* API Key Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Google Places API Key
                <span className="text-zinc-400 font-normal ml-1">
                  (Leave empty if configured in .env.local as GOOGLE_PLACES_API_KEY)
                </span>
              </label>
              <div className="relative">
                <input
                  type={showApiKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={
                    serverStatus.hasEnvApiKey
                      ? "Using server .env key (or paste key here to override)"
                      : "AIzaSy..."
                  }
                  className="w-full pl-3 pr-10 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-2.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                >
                  {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Place ID Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Google Place ID
                <span className="text-zinc-400 font-normal ml-1">
                  (e.g., ChIJ... or use the Search tool on the right)
                </span>
              </label>
              <input
                type="text"
                value={placeId}
                onChange={(e) => setPlaceId(e.target.value)}
                placeholder="ChIJN1t_tDeuEmsRUsoyG83frY4"
                className="w-full px-3 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>

            {/* Fetch Button */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => handleFetchReviews()}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-medium text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50 text-sm shadow-sm"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Fetching from Google API...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Fetch Reviews (Places API New)
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setSummary(null);
                  setReviews([]);
                  setRawResponse(null);
                  setErrorDetails(null);
                }}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                Clear Results
              </button>
            </div>
          </div>

          {/* Place ID Finder Card */}
          <div className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
              <Search className="w-5 h-5 text-indigo-500" />
              Find Place ID by Name
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Don&apos;t know your Place ID yet? Search your business name and city to find your exact
              Place ID instantly using Google Places Text Search.
            </p>

            <form onSubmit={handleSearchPlace} className="space-y-3">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g. Jalaram Digital Sign Surat"
                  className="w-full pl-3 pr-20 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  disabled={searchLoading}
                  className="absolute right-1.5 top-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90 disabled:opacity-50"
                >
                  {searchLoading ? "Searching..." : "Search"}
                </button>
              </div>
            </form>

            {/* Search Results list */}
            {searchResults.length > 0 && (
              <div className="mt-3 space-y-2 max-h-56 overflow-y-auto pr-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Select your business:
                </p>
                {searchResults.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 hover:border-indigo-400 transition-colors text-xs space-y-1.5"
                  >
                    <div className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center justify-between">
                      <span>{item.displayName?.text || "Unknown"}</span>
                      {item.rating && (
                        <span className="flex items-center text-amber-500 font-bold">
                          ★ {item.rating} ({item.userRatingCount || 0})
                        </span>
                      )}
                    </div>
                    <p className="text-zinc-500 text-[11px] truncate">
                      {item.formattedAddress}
                    </p>
                    <div className="flex items-center justify-between pt-1">
                      <code className="text-[10px] text-zinc-400 font-mono select-all">
                        {item.id}
                      </code>
                      <button
                        type="button"
                        onClick={() => {
                          setPlaceId(item.id);
                          handleFetchReviews(item.id);
                        }}
                        className="px-2 py-1 bg-indigo-600 text-white rounded text-[11px] font-medium hover:bg-indigo-700"
                      >
                        Use &amp; Fetch
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Error Alert if any */}
        {errorDetails && (
          <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-2xl p-5 space-y-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <div className="space-y-2 flex-1">
                <div className="font-semibold text-red-900 dark:text-red-200 text-sm">
                  {errorDetails.error || "An error occurred with the Google Places API"}
                </div>
                {errorDetails.httpStatus && (
                  <p className="text-xs text-red-700 dark:text-red-300">
                    HTTP Status: <span className="font-mono">{errorDetails.httpStatus}</span>
                  </p>
                )}
                {errorDetails.tips && (
                  <ul className="text-xs list-disc list-inside space-y-1 text-red-700 dark:text-red-300 pt-1">
                    {errorDetails.tips.map((tip: string, idx: number) => (
                      <li key={idx}>{tip}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Place Summary Header (When loaded) */}
        {summary && (
          <div className="bg-gradient-to-br from-indigo-50 to-white dark:from-zinc-900 dark:to-zinc-900 border border-indigo-100 dark:border-zinc-800 rounded-2xl p-6 sm:p-7 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Building className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                    {summary.name || "Business Name"}
                  </h3>
                </div>
                {summary.address && (
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-zinc-400 shrink-0" />
                    {summary.address}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-4 bg-white dark:bg-zinc-800 p-3 sm:px-4 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm shrink-0">
                <div className="text-center">
                  <div className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
                    {summary.rating ? summary.rating.toFixed(1) : "N/A"}
                  </div>
                  <div className="flex justify-center mt-1">
                    {summary.rating ? renderStars(summary.rating) : null}
                  </div>
                  <div className="text-[11px] text-zinc-500 mt-1">
                    {summary.totalReviews} total Google reviews
                  </div>
                </div>
              </div>
            </div>

            {summary.googleMapsUri && (
              <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center gap-4 text-xs">
                <a
                  href={summary.googleMapsUri}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                >
                  View on Google Maps <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <span className="text-zinc-400">&bull;</span>
                <span className="text-zinc-500">
                  Reviews fetched: <strong>{summary.reviewsCount}</strong> (Places API returns top
                  5 reviews)
                </span>
              </div>
            )}
          </div>
        )}

        {/* View Switcher Tabs */}
        {(reviews.length > 0 || rawResponse) && (
          <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
            <button
              onClick={() => setActiveTab("formatted")}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeTab === "formatted"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                }`}
            >
              <span className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Formatted Reviews ({reviews.length})
              </span>
            </button>
            <button
              onClick={() => setActiveTab("raw")}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeTab === "raw"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                }`}
            >
              <span className="flex items-center gap-2">
                <Code2 className="w-4 h-4" />
                Raw Google API Response (JSON)
              </span>
            </button>
            <button
              onClick={() => setActiveTab("docs")}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeTab === "docs"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                }`}
            >
              <span className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4" />
                Integration Guide
              </span>
            </button>
          </div>
        )}

        {/* Tab 1: Formatted Reviews View */}
        {activeTab === "formatted" && reviews.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {rev.authorPhotoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={rev.authorPhotoUrl}
                          alt={rev.authorName}
                          className="w-10 h-10 rounded-full object-cover border border-zinc-200 dark:border-zinc-700"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center text-sm">
                          {rev.authorName.charAt(0) || "U"}
                        </div>
                      )}
                      <div>
                        {rev.authorProfileUrl ? (
                          <a
                            href={rev.authorProfileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm hover:underline flex items-center gap-1"
                          >
                            {rev.authorName}
                            <ExternalLink className="w-3 h-3 text-zinc-400" />
                          </a>
                        ) : (
                          <div className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">
                            {rev.authorName}
                          </div>
                        )}
                        <div className="text-xs text-zinc-400">{rev.relativeTime}</div>
                      </div>
                    </div>
                    {renderStars(rev.rating)}
                  </div>

                  <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed italic">
                    &ldquo;{rev.text || "(No written text comment provided)"}&rdquo;
                  </p>
                </div>

                <div className="text-[11px] text-zinc-400 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  Language: {rev.originalLanguage.toUpperCase()}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Raw JSON View */}
        {activeTab === "raw" && rawResponse && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-sm space-y-3 text-zinc-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono">
                Places API (New) Payload
              </span>
              <button
                type="button"
                onClick={handleCopyJson}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy JSON
                  </>
                )}
              </button>
            </div>
            <pre className="p-4 bg-zinc-950 rounded-xl overflow-x-auto text-xs font-mono text-emerald-400 max-h-[500px]">
              {JSON.stringify(rawResponse, null, 2)}
            </pre>
          </div>
        )}

        {/* Integration Instructions Card */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-7 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Info className="w-4 h-4 text-indigo-500" />
            Next Steps: How to add your API Key in your environment
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 space-y-2">
              <span className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                Step 1: Google Cloud Console
              </span>
              <p className="text-zinc-600 dark:text-zinc-400">
                Go to Google Cloud Console, ensure a billing account is linked, and enable{" "}
                <strong>Places API (New)</strong> under APIs &amp; Services.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 space-y-2">
              <span className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                Step 2: Add to .env.local
              </span>
              <p className="text-zinc-600 dark:text-zinc-400">
                In your project root, add your credentials inside <code>.env.local</code>:
              </p>
              <pre className="p-2 bg-zinc-100 dark:bg-zinc-900 rounded font-mono text-[11px] overflow-x-auto">
                GOOGLE_PLACES_API_KEY=AIzaSy...&#10;GOOGLE_PLACE_ID=ChIJ...
              </pre>
            </div>

            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 space-y-2">
              <span className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                Step 3: Verification
              </span>
              <p className="text-zinc-600 dark:text-zinc-400">
                Once set, this test page and endpoint will automatically read the key securely from
                the server environment without exposing it to client browsers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
