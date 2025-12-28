interface Community {
    communityName: string,
    communityDescription: string,
}

interface User {
    name: string
}

export interface Group {
    id: string,
    name: string,
    description: string,
    image: string
    type: string,
    createdBy: string,
    communityId: string,
    isActive: boolean,
    memberCount: number,
    community: Community,
    user: User,
    myCommunity: Community,
}
