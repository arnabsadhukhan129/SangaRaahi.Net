export interface viewSupplier{
    id?: string,
    eventId?: string,
    supplyItem?: string,
    quantity?: number,
    neededFor?: string,
    requiredDate?: string
    supplyItemDescription?: string,
    volunteered?: any,
    isDone?: boolean,
    teamSize?: teamSize,
    time?: Time,
}

interface teamSize{
    adult?: number,
    teenager?: number,
    children?: number
}

interface Time{
    from: string,
    to: string
}