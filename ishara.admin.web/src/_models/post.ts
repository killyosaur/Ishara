export interface Post {
    id: string;
    title: string;
    content: string;
    modifiedOn: Date;
    publishedOn: Date | null | undefined;
    authorId: string;
};