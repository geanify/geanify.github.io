export interface Level {
    id: string;
    name: string;
    description: string;
    folder: string;
    websites: string[];
}

export const levels: Level[] = [
    {
        id: 'level1',
        name: 'Level 1: The Beginning',
        description: 'Your first steps into the nexus. Learn the basics of navigation and data gathering.',
        folder: 'level1',
        websites: ['forum', 'marketplace', 'blog']
    },
    {
        id: 'level2',
        name: 'Level 2: The Network',
        description: 'Expand your reach. Multiple nodes have been identified in this sector.',
        folder: 'level2',
        websites: ['website1', 'website2']
    }
];
