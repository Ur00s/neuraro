import { Replies } from "./Replies";

export interface TopicDetails {
    id: BigInteger;
    userID: number;
    user: any;
    topicID: number;
    topic: any;
    comment: string;
    autor: string;
    likes: number;
    isLiked: boolean;
    lClass: string;
    position: number;
    isEditing:boolean;
    EdditTogle:boolean;
    Replies: Replies[];
}
