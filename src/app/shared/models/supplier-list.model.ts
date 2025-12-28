export interface Supplier{
    id?: string,
    eventId?: string,
    supplyItem?: string,
    quantity?: number,
    supplyItemDescription?: string,
    neededFor?: string,
    requiredDate?: string,
    alreadyTaken?: number,
    previous?: number,
    assignedMembersCount?: number,
    assignedMembers?: any,
    isDonee?: boolean,
    isDone?: boolean,
    time: Time,
}

interface Time{
    from: string,
    to: string,
    timezone: string
}
