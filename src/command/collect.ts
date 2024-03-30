/* Homework */
import fs from "fs-extra";
import type { IResourceOperator } from "@/core/types";
import { ProcessState } from "../utils";
import { JSONStorage } from "../core/JSONStorage";

interface Book {
    bookId: string;
    bookName: string;
    isbn: string;
}
interface Collect {
    name: string
    books: Book[]
}

export class CollectOperator implements IResourceOperator
{
    resources: JSONStorage<Collect>;
    constructor(storage: JSONStorage<Collect>)
    {
        this.resources = storage;
    }
    private checkisNumber(input: string): boolean
    {
        if (typeof input !== 'string')
        {
            return false;
        }
        if(Number.isNaN(+input))
        {
            return false;
        }
        return true;
    }
    private checkisbn(isbn: string): boolean
    {
        if(this.checkisNumber(isbn) === false || isbn.length !== 13)
        {
            return false;
        }
        const chararr = isbn.split('');
        const T1 = (chararr[1].charCodeAt(0) +
                    chararr[3].charCodeAt(0) +
                    chararr[5].charCodeAt(0) +
                    chararr[7].charCodeAt(0) +
                    chararr[9].charCodeAt(0) +
                    chararr[11].charCodeAt(0) -
                    ('0'.charCodeAt(0) * 6)) * 3;
        const T2 = (chararr[0].charCodeAt(0) +
                    chararr[2].charCodeAt(0) +
                    chararr[4].charCodeAt(0) +
                    chararr[6].charCodeAt(0) +
                    chararr[8].charCodeAt(0) +
                    chararr[10].charCodeAt(0) -
                    ('0'.charCodeAt(0) * 6));
        const T3 = (T1 + T2) % 10;
        if(10 - T3 !== chararr[12].charCodeAt(0) - '0'.charCodeAt(0))
        {
            return false;
        }
        return true;
    }
    isValidateCmd(...args: any[]): ProcessState
    {
        let finalstate = ProcessState.SUCCESS;
        switch (args[0])
        {
            case 'import':
                if(args[1].fileName === undefined)
                {
                    finalstate = ProcessState.ERR_ARGS_FNAME;
                }
                break;
            case 'drop':
                if ('collect' in args[1] && args[1].collect === undefined)
                {
                    finalstate = ProcessState.ERR_ARGS_COLLE;
                }
                break;
            case 'make':
            case 'delete':
                if(args[1].collect === undefined)
                {
                    finalstate = ProcessState.ERR_ARGS_COLLE;
                }
                break;
            case 'insert':
                if(args[1].collect === undefined)
                {
                    finalstate = ProcessState.ERR_ARGS_COLLE;
                }
                else if(args[1].books === undefined && args[1].books === undefined)
                {
                    finalstate = ProcessState.ERR_ARGS_BOOK;
                }
                else
                {
                    for(let i = 0; i < args[1].books.length;++i)
                    {
                        if(args[1].books[i] === undefined)
                        {
                            finalstate = ProcessState.ERR_ARGS_BOOK;
                            break;
                        }
                    }
                }
                break;
            case 'update':
                if(args[1].collect === undefined)
                {
                    finalstate = ProcessState.ERR_ARGS_COLLE;
                }
                else if(args[1].bookId === undefined && args[1].bookIds === undefined)
                {
                    finalstate = ProcessState.ERR_ARGS_ID;
                }
                else if(args[1].bookName === undefined && args[1].bookNames === undefined)
                {
                    finalstate = ProcessState.ERR_ARGS_BOOK;
                }
                break;
            default:
                break;
        }
        return finalstate;
    }
    drop(...args: any[]): number
    {
        if(args[0].collect === undefined)
        {
            if (this.resources.size() === 0)
            {
                return 0;
            }
            const output = this.resources.size();
            this.resources.clear();
            return output;
        }
        if(this.resources.getItem(args[0].collect) === undefined)
        {
            throw ProcessState.ERR_COLLE;
        }
        this.resources.removeItem(args[0].collect);
        return 1;
    }
    make(...args: any[]): boolean
    {
        if (this.resources.getItem(args[0].collect) !== undefined)
        {
            throw ProcessState.ERR_COLLE_DUPL;
        }
        this.resources.setItem(args[0].collect,{"name": args[0].collect, "books":[]});
        return true;
    }
    insert(...args: any[]): number
    {
        if(this.resources.getItem(args[0].collect) === undefined)
        {
            throw ProcessState.ERR_COLLE;
        }
        const Coll = this.resources.getItem(args[0].collect);
        if(Coll !== undefined)
        {
            for(let i = 0; i < args[0].books.length; ++i)
            {
                if(this.checkisNumber(args[0].books[i].bookId) === false)
                {
                    throw ProcessState.ERR_ID;
                }
                if(Coll.books.find((x: { bookId: string; }) => x.bookId === args[0].books[i].bookId) !== undefined)
                {
                    throw ProcessState.ERR_ID_DUPL;
                }
                if(this.checkisbn(args[0].books[i].isbn) === false)
                {
                    throw ProcessState.ERR_ISBN;
                }
                if(Coll.books.find((x: { isbn: string; }) => x.isbn === args[0].books[i].isbn)!== undefined)
                {
                    throw ProcessState.ERR_ISBN_DUPL;
                }
            }
            for(let i = 0; i < args[0].books.length; ++i)
            {
                Coll.books.push(args[0].books[i]);
            }
            this.resources.setItem(Coll.name,{"name": Coll.name, "books": Coll.books});
            return args[0].books.length;
        }
        return 0;
    }
    update(...args: any[]): boolean
    {
        if(this.resources.getItem(args[0].collect) === undefined)
        {
            throw ProcessState.ERR_COLLE;
        }
        const Coll = this.resources.getItem(args[0].collect);
        if(Coll !== undefined)
        {
            const target = Coll.books.find((x: { bookId: string; }) => x.bookId === args[0].bookId);
            if(this.checkisNumber(args[0].bookId) === false
             || target === undefined)
            {
                throw ProcessState.ERR_ID;
            }
            target.bookName = args[0].bookName;
            this.resources.setItem(Coll.name,{"name": Coll.name, "books": Coll.books});
        }
        else
        {
            return false;
        }
        return true;
    }
    delete(...args: any[]): number
    {
        let deletecount = 0;
        if(this.resources.getItem(args[0].collect) === undefined)
        {
            throw ProcessState.ERR_COLLE;
        }
        const Coll = this.resources.getItem(args[0].collect);
        if(Coll !== undefined)
        {
            let deleteindex  = 0;
            if(args[0].bookIds !== undefined)
            {
                for(let i = 0; i < args[0].bookIds.length; ++i)
                {
                    deleteindex = Coll.books.findIndex((x: { bookId: string; }) => x.bookId === args[0].bookIds[i]);
                    if(deleteindex !== -1)
                    {
                        Coll.books.splice(deleteindex, 1);
                        ++deletecount;
                    }
                }
            }
            if(args[0].bookNames !== undefined)
            {
                for(let i = 0; i < args[0].bookNames.length; ++i)
                {
                    deleteindex = Coll.books.findIndex((x: { bookName: string; }) => x.bookName === args[0].bookNames[i]);
                    if(deleteindex !== -1)
                    {
                        Coll.books.splice(deleteindex, 1);
                        ++deletecount;
                    }
                }
            }
            this.resources.setItem(Coll.name,{"name": Coll.name, "books": Coll.books});
        }
        return deletecount;
    }
    import(filename: string): void
    {
        if (!fs.existsSync(filename))
        {
            throw ProcessState.ERR_FNAME;
        }
        const importdata = fs.readJsonSync(filename);
        Object.keys(importdata).forEach((key) =>
        { 
            const Coll = this.resources.getItem(key);
            if(Coll !== undefined)
            {
                throw ProcessState.ERR_COLLE_DUPL;
            }
        });
        Object.keys(importdata).forEach((key) =>
        { 
            for(let i = 0; i < importdata[key].books.length;++i)
            {
                if(this.checkisNumber(importdata[key].books[i].bookId) === false)
                {
                    throw ProcessState.ERR_ID;
                }
                if(this.checkisbn(importdata[key].books[i].isbn) === false)
                {
                    throw ProcessState.ERR_ISBN;
                }
            }
        });
        Object.keys(importdata).forEach((key) =>
        { 
            this.resources.setItem(key,{'name': key, 'books': importdata[key].books});
        });
    }
}