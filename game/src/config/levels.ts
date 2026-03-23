export interface Level {
    id: string;
    name: string;
    folder: string;
    websites: string[];
}

export const levels: Level[] = [
    {
        id: 'level1',
        name: 'Level 1: The Beginning',
        folder: 'level1',
        websites: ['forum', 'marketplace', 'blog']
    }
];
