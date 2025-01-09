import { browser } from '$app/environment';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, url, data }) => {
    console.log(`Server fetched: ${data.fetched}, last fetch: ${data.lacarteLastFetch}, server piece count: ${data.pieces.length}`)
    console.debug(`Server data: ${JSON.stringify(data)}`)
    if (browser) {
        // If the server did fetch new data then set it in local storage
        if (data?.fetched && data.pieces) {
            localStorage.setItem('lacartePieces', JSON.stringify(data.pieces));
            return { fetched: true, lacarteLastFetch: data.lacarteLastFetch, pieces: data.pieces };
        }
        else {
            console.log(`Attempting to load cached data`)
            const localData = localStorage.getItem('lacartePieces');
            if (localData) {
                const pieces = JSON.parse(localData);
                console.log(`Cached piece count: ${pieces.length}`)
                return { fetched: false, lacarteLastFetch: data.lacarteLastFetch, pieces: pieces };
            } else {
                console.error(`No data from the server or local storage`);
                return { fetched: false, lacarteLastFetch: data.lacarteLastFetch, pieces: [] };
            }
        }
    }
}