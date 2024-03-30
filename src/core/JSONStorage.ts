/* Homework */
// Todo: 檔案存儲
import fs from "fs-extra";
import type {IStorage} from "@/core/types";

export class JSONStorage<T = any> implements IStorage
{
    Data: Record<string, any> = {};
    StorageFile: string = "";
    constructor(FilePath: string)
    {
        this.StorageFile =  FilePath;
        fs.ensureDirSync(this.StorageFile);
        this.StorageFile = this.StorageFile.concat('\\storage.json');
        if(fs.existsSync(this.StorageFile))
        {
            this.Data = fs.readJsonSync(this.StorageFile,{flag:'r+'});
        }    
    }
    size(): number
    {
        return Object.keys(this.Data).length;
    }
    getItem(key: string): T | undefined
    {
        if (this.Data[key] === undefined)
        {
            return undefined;
        }
        return JSON.parse(JSON.stringify(this.Data[key]));
    }
    setItem(key: string, value: T): T
    {
        this.Data[key] = value;
        fs.writeJSONSync(this.StorageFile, this.Data, {flag: 'w+'});
        return JSON.parse(JSON.stringify(this.Data[key]));
    }
    removeItem(key: string): boolean
    {
        if (this.Data[key] === undefined)
        {
            return false;
        }
        delete this.Data[key];
        fs.writeJSONSync(this.StorageFile, this.Data, {flag: 'w+'});
        return true;
    };
    clear(): boolean
    {
        if (this.size() === 0)
        {
            return false;
        }
        Object.keys(this.Data).forEach((key) => delete this.Data[key]);
        fs.writeJSONSync(this.StorageFile, this.Data, {flag: 'w+'});
        return true;
    };
}