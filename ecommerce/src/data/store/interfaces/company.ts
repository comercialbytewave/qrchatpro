
export interface Company {
    id: number,
    name: string
    phone: string,
    email: string,
    status: true,
    dueDate: string
    recurrence: string
    schedules: any[]
    planId: number
    mode: string,
    primaryColor: string
    mediaPath: string | null
    mediaName: string | null
    token: string
    slug: string
    createdAt: string
    updatedAt: string
}