interface Community{
  id: string,
  ownerId: string,
  communityName: string
}


export interface Announcement {
    id: string,
    userId: string,
    communityId: string,
    title: string,
    description: string,
    endDate: string,
    toWhom: string,
    isActive: string,
    type: string,
    community: Community,    
    image : string
}