export interface requestMember {
    id?: string,
    communityName?: string,
    members?: members

}

interface members{
    memberId?: string,
    roles?: any
    joinedAt?: string,
    user?: user
}

interface user{
    id?: string,
    name?: string,
    profileImage?: string
}