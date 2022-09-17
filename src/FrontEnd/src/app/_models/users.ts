export interface User {
    id: BigInteger;
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    passwordHash: string;
    passwordSalt: string;
    role: string;
    PD: string;
    editInput:boolean;
    editText:boolean;
    editing:boolean;
    editingTitle:string;
    form:any;
    token: any;
    imageUrl: any;
    //token: string;
}
