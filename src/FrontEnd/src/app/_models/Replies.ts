export interface Replies {
    id: BigInteger;
    userID: number;
    user: any;
    ParentID: number;
    parent: any;
    comment: string;
    autor: string;
    likes: number;
    isLiked: boolean;
    lClass: string;
    position: number;
    isEditing:boolean;
    EdditTogle:boolean;
}
