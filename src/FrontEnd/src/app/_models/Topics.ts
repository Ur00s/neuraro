export interface Topic {
    id: BigInteger;
    title: string;
    userID: BigInteger;
    user: any;
    creationDate: Date;
    autor: string;
    description: string;
    isEditing:boolean;
}
