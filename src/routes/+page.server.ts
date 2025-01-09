import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies, url, fetch }) => {
    const staleThresholdMs = 60 * 60 * 1000;

    const lacarteLastFetch = cookies.get('lacarteLastFetch') || '';
    let forceRefresh = url.searchParams.get('refresh') === 'true';
    console.log(`lacarteLastFetch: ${lacarteLastFetch}, forceRefresh: ${forceRefresh}`);

    try {
        const lastFetchParsed = new Date(Number(lacarteLastFetch));
        const differenceInMs = Date.now() - lastFetchParsed.getTime();
        const isStale = differenceInMs > staleThresholdMs;
        console.debug(`Stale: ${isStale}, differenceInMs: ${differenceInMs}, staleThresholdMs: ${staleThresholdMs}`);
        if (!isStale && !forceRefresh) {
            console.debug(`lacarteLastFetch: ${lacarteLastFetch}, isStale: ${isStale}, forceRefresh: ${forceRefresh}`);
            return { fetched: false, lacarteLastFetch, pieces: [] }
        }
    } catch (error) {
        if (!(error instanceof RangeError)) {
            throw error;
        } else if (error instanceof RangeError) {
            console.error(`Error parsing ${lacarteLastFetch}: ${error}`);
            forceRefresh = true;
        }
    }

    console.log('Fetching fresh Reddit pieces data');
    const piecesResp = await fetch('api/pieces/reddit');
    const { pieces } = await piecesResp.json();
    const timestamp = Date.now().toString();
    cookies.set('lacarteLastFetch', timestamp, { path: '/' });
    console.log(`Fetched ${pieces.length} pieces, setting last fetch to ${timestamp}`);
    return { fetched: true, lacarteLastFetch: timestamp, pieces }
}