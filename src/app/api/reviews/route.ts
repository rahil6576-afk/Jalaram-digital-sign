export async function GET() {
    const placeId = 'ChIJ__8PjLErXDkRNGWrTxJ2wwA' // No space!
    const apiKey = 'AIzaSyAL22l4qyPMGMu2-6BXjUZa0mYO05wrN9A'

    const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,reviews,user_ratings_total&key=${apiKey}&limit=10`
    )

    const data = await response.json()
    console.log('🚀 ~ GET ~ data:', data)

    if (!data.result || !data.result.reviews) {
        return new Response(JSON.stringify({ reviews: [] }), { status: 200 })
    }

    // Only keep 5-star reviews, remove 1-star, 2-star and non-5-star reviews
    const reviews = (data.result.reviews || [])
        .filter((r: { rating?: number }) => r.rating === 5)
        .map((r: { author_name?: string; profile_photo_url?: string; rating?: number; text?: string }) => ({
            user: r.author_name,
            photo: r.profile_photo_url,
            rating: 5,
            text: r.text
        }))

    const ratings = {
        name: data?.result?.name,
        rating: data?.result?.rating,
        totalReviews: data?.result?.user_ratings_total
    }

    return new Response(JSON.stringify({ reviews, ratings }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
    })
}
