export const generateRandomString = (length: number) => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

export const potatoLinks: Record<string, string> = {}; // domain -> site name
export const reversePotatoLinks: Record<string, string> = {}; // site name -> domain
export let currentLevelFolder = '';

export const initializeLinks = (levelFolder: string, sites: string[]) => {
    currentLevelFolder = levelFolder;
    // Clear existing mappings
    for (const key in potatoLinks) delete potatoLinks[key];
    for (const key in reversePotatoLinks) delete reversePotatoLinks[key];
    
    sites.forEach(site => {
        const randomDomain = `${generateRandomString(32)}.potato`;
        potatoLinks[randomDomain] = site;
        reversePotatoLinks[site] = randomDomain;
    });
};

export const resolvePotatoLink = (url: string): { src: string, displayUrl: string } | null => {
    // Basic normalization
    let cleanUrl = url.trim().toLowerCase();
    if (cleanUrl.startsWith('http://')) cleanUrl = cleanUrl.replace('http://', '');
    if (cleanUrl.startsWith('https://')) cleanUrl = cleanUrl.replace('https://', '');
    if (cleanUrl.endsWith('/')) cleanUrl = cleanUrl.slice(0, -1);
    
    const parts = cleanUrl.split('/');
    const domain = parts[0];
    const path = parts.length > 1 ? parts.slice(1).join('/') : 'index.html';
    
    const site = potatoLinks[domain];
    if (!site) return null;
    
    // Return the actual local src and the cleaned display URL
    return {
        src: `/websites/${currentLevelFolder}/${site}/${path}`,
        displayUrl: `${domain}/${path === 'index.html' && parts.length === 1 ? '' : path}`.replace(/\/$/, '')
    };
};
