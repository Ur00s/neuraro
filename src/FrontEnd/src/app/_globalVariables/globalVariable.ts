import { SavedFile } from "../_models/SavedFile";

export class GlobalVariable{
    public static trainingStarted:boolean = false;
    public static numPages:number = 0;
    public static currentPage:number = 1;
    public static fileprojects:boolean=true;
    public static data:boolean=false;
    public static parameters:boolean=false;
    public static models:boolean=false;
    public static expName:string="";
    public static expCsv:string;

    public static isGoogleUser:boolean;

    static DefaultPage()
    {
        sessionStorage.setItem('fileprojects',JSON.stringify(this.fileprojects));
        sessionStorage.setItem('dataPage',JSON.stringify(this.data));
        sessionStorage.setItem('parameters',JSON.stringify(this.parameters));
        sessionStorage.setItem('models',JSON.stringify(this.models));
    }
    static ChangeValues()
    {
        sessionStorage.setItem('fileprojects',JSON.stringify(this.fileprojects));
        sessionStorage.setItem('dataPage',JSON.stringify(this.data));
        sessionStorage.setItem('parameters',JSON.stringify(this.parameters));
        sessionStorage.setItem('models',JSON.stringify(this.models));
    }
    static setNumPages(val:number)
    {
        this.numPages = val;
    }

    static getNumPages():number
    {
        return this.numPages;
    }

    static setCurrentPage(val:number)
    {
        this.currentPage = val;
    }

    static getCurrentPage():number
    {
        return this.currentPage;
    }

    static getTrainingStarted():boolean
    {
        return this.trainingStarted;
    }

    static setTrainingStarted(val:boolean)
    {
        this.trainingStarted = val;
    }
}