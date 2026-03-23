export const generateRandomString = (length: number) => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

const sites = ['forum', 'marketplace', 'blog'];
export const potatoLinks: Record<string, string> = {};
export const reversePotatoLinks: Record<string, string> = {};

// Initialize on load
sites.forEach(site => {
    const randomDomain = `${generateRandomString(12)}.potato`;
    const targetUrl = `/websites/${site}.html`;
    potatoLinks[randomDomain] = targetUrl;
    reversePotatoLinks[targetUrl] = randomDomain;
});

export const resolvePotatoLink = (url: string): string | null => {
    // Basic normalization
    let cleanUrl = url.trim().toLowerCase();
    if (cleanUrl.startsWith('http://')) cleanUrl = cleanUrl.replace('http://', '');
    if (cleanUrl.startsWith('https://')) cleanUrl = cleanUrl.replace('https://', '');
    if (cleanUrl.endsWith('/')) cleanUrl = cleanUrl.slice(0, -1);
    
    return potatoLinks[cleanUrl] || null;
};
