export interface viewTask{
    id?: string,
    eventId?: string,
    eventName?: string,
    taskName?: string,
    priority?: string,
    taskDescription?: string,
    taskStartDate?: string,
    taskDeadline?: string,
    requireTeam?: number,
    isDone?: boolean,
    teamSize?: teamSize,
    time?: Time
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