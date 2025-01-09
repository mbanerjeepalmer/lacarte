
export async function load({ fetch }) {
    const piecesResp = await fetch('/api/pieces/reddit');
    const pieces = await piecesResp.json();
    return { pieces };
}
