import { browser } from '$app/environment';

export async function load({ fetch, url }) {
    const forceRefresh = url.searchParams.get('refresh') === 'true';


    if (browser) {
        console.log(`In the browser`)
        const cachedData = localStorage.getItem('lacartePieces');
        const cachedTimestamp = localStorage.getItem('lacartePiecesTimestamp');

        const now = Date.now();
        const twentyMinutesInMs = 20 * 60 * 1000;


        console.debug(`cachedData: ${cachedData}`,
            `cachedTimestamp: ${cachedTimestamp}`, `forceRefresh: ${forceRefresh}`)

        if (cachedData && cachedTimestamp && !forceRefresh) {
            const age = now - parseInt(cachedTimestamp);
            if (age < twentyMinutesInMs) {
                console.debug('Using cached Reddit pieces data');
                return { pieces: JSON.parse(cachedData) };
            }
        }
    }


    console.log('Fetching fresh Reddit pieces data');
    const piecesResp = await fetch('/api/pieces/reddit');
    const pieces = await piecesResp.json();


    if (typeof window !== 'undefined') {
        localStorage.setItem('redditPieces', JSON.stringify(pieces));
        localStorage.setItem('redditPiecesTimestamp', Date.now().toString());
    }

    return { pieces };
}
