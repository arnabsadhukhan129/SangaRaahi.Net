export interface blog {
    id?: string,
    eventName?: string,
    postedBy?: string,
    thumbnailImage?: string,
    image?: string,
    pdf?: string,
    blogTitle?: string,
    blogCategory?: string,
    blogDescription?: string,
    blogStatus?: boolean,
    paymentStatus?: boolean;
    createdAt?: string;
    paymentStatusTimeVerify?: boolean;
    paymentStatusTimestamp?: string;
}