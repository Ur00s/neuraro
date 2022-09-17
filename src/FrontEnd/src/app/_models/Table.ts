export class Table {
    
    public static data: any = {};
    public static showTable: boolean = false;
    public static showSpinner: boolean = false;
    public static inputs:string[] = [];
    public static output:string;
    public static path: string;
    public static NotRefresh:boolean=false;
    public static encodings: any[] = [];
    public static stats:any[] = []

    public static getShowTable(): boolean {
        return this.showTable;
    }

    public static setShowTable(showTable: boolean): void {
        this.showTable = showTable;
    }

    public static getShowSpinner(): boolean {
        return this.showSpinner;
    }

    public static setShowSpinner(showSpinner: boolean): void {
        this.showSpinner = showSpinner;
    }

    public static setPath(path: string):void {
        this.path = path;
    }

    public static getPath() {
        return this.path;
    }
}