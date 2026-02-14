export async function POST(request: Request) {
  try {
    const { move } = await request.json()

    if (!move || !move.trim()) {
      return Response.json({ error: 'Move name required' }, { status: 400 })
    }

    const searchQuery = `${move} tutorial BJJ`

    const response = await fetch(
      `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(
        searchQuery
      )}&count=3`,
      {
        headers: {
          Accept: 'application/json',
          'X-Subscription-Token': process.env.BRAVE_API_KEY || '',
        },
      }
    )

    if (!response.ok) {
      console.error('Brave API error:', response.status)
      return Response.json(
        { videos: [] },
        { status: 200 }
      )
    }

    const data = await response.json()

    const videos = (data.web?.results || [])
      .filter((result: any) =>
        result.title?.toLowerCase().includes('tutorial') ||
        result.title?.toLowerCase().includes('how to')
      )
      .slice(0, 3)
      .map((result: any) => ({
        title: result.title,
        url: result.url,
      }))

    return Response.json({ videos })
  } catch (error) {
    console.error('Search error:', error)
    return Response.json({ videos: [] }, { status: 200 })
  }
}
