import axios from 'axios';
import Cookies from 'js-cookie';
import * as casbin from 'casbin';
import Permission from './Permission';
// import Enforcer from './Enforcer'
import { StringKV } from './types';
import * as Cache from './Cache';

interface BaseResponse {
    message: string;
    data: any;
}

type Mode = "auto" | "cookies" | "manual"

export class Authorizer {
    private mode!: Mode;
    private endpoint: string | undefined = undefined;
    private user : string | undefined;
    private permission = new Permission();
    private cookieKey : string | undefined = undefined;
    private cacheExpiredTime  = 60; // Seconds
    // private enforcer :Enforcer;
    private enforcer:casbin.Enforcer | undefined;

    /**
     * 
     * @param mode "auto", "cookies" or "manual"
     * "auto": Specify the casbin server endpoint, and Casbin.js will load permission from it when the identity changes
     * "cookies": Casbin.js load the permission data from the cookie "casbin_permission" or the specified cookie key.
     * "manual": Load the permission mannually with "setPermission"
     * @param args.endpoint Casbin service endpoint, REQUIRED when mode == "auto"
     * @param args.cacheExpiredTime The expired time of local cache, Unit: seconds, Default: 60s, activated when mode == "auto" 
     * @param args.cookieKey The cookie key when loading permission, activated when mode == "cookies"
     */
    constructor(mode: Mode = "manual", args: {endpoint?: string, cookieKey?: string, cacheExpiredTime?: number} = {}) {
        if (mode == 'auto') {
            if (!args.endpoint) {
                throw new Error("Specify the endpoint when initializing casbin.js with mode == 'auto'");
            } else {
                this.mode = mode;
                this.endpoint = args.endpoint;
                if (args.cacheExpiredTime !== null && args.cacheExpiredTime !== undefined) {
                    this.cacheExpiredTime = args.cacheExpiredTime; 
                }
            }
        } else if (mode == 'cookies') {
            this.mode = mode;
            const permission = Cookies.get(args.cookieKey ? args.cookieKey : "casbin_perm");
            if (permission) {
                this.setPermission(permission);
            } else {
                console.log("WARNING: No specified cookies");
            }
        } else if (mode == 'manual') {
            this.mode = mode;
        } else {
            throw new Error("Casbin.js mode can only be one of the 'auto', 'cookies' and 'manual'");
        }
    }

    /**
     * Get the permission.
     */
    public getPermission() : StringKV {
        return this.permission.getPermissionJsonObject();
    }

    public setPermission(permission : Record<string, unknown> | string) : void{
        this.permission.load(permission);
    }
    
    
    public async initEnforcer(s: string): Promise<void> {
        const obj = JSON.parse(s);
        if (!('m' in obj)) {
            throw Error("No model when initEnforcer.")
        }
        const m = casbin.newModelFromString(obj['m']);
        this.enforcer = await casbin.newEnforcer(m);
        if ('p' in obj) {
            for (let sArray of obj['p']) {
                this.enforcer.addPolicy(sArray[1], sArray[2], sArray[3]);
            }
        }
        console.log(`kingiw ${await this.enforcer.enforce('alice', 'data1', 'read')}`)
    }

    /**
     * Get the authority of a given user from Casbin core
     */
    public async syncUserPermission(): Promise<void> {
        if (this.endpoint !== undefined && this.endpoint !== null) {
            const resp = await axios.get<BaseResponse>(`${this.endpoint}?casbin_subject=${this.user}`);
            
            this.permission.load(resp.data.data);
        }
    }

    /**
     * Set the user subject for the authroizer
     * @param user The current user
     */
    public async setUser(user : string) : Promise<void> {
        // Sync with the server and fetch the latest permission of the new user
        // if (this.mode == 'auto' && user != this.user) {
        //     this.user = user;
        //     const permStr = Cache.loadFromLocalStorage(user);
        //     if (permStr === null) {
        //         await this.syncUserPermission();
        //         Cache.saveToLocalStorage(user, this.permission.getPermissionString(), this.cacheExpiredTime);
        //     } else {
        //         this.permission.load(permStr);
        //     }
        // }        
        this.user = user;
    }

    public async can(action: string, object: string): Promise<boolean> {
        if (this.enforcer === undefined) {
            throw Error("Enforcer not initialized");
        } else {
            return this.enforcer.enforce(this.user, object, action);
        }
    }

    public cannot(action: string, object: string): boolean {
        return !this.can(action, object);
    }

    public canAll(action: string, objects: Array<string>) : boolean {
        for (let i = 0; i < objects.length; ++i) {
            if (!this.permission.check(action, objects[i])) {
                return false;
            }
        }
        return true;
    }

    public canAny(action: string, objects: Array<string>) : boolean {
        for (let i = 0; i < objects.length; ++i) {
            if (this.permission.check(action, objects[i])) {
                return true;
            }
        }
        return false;
    }

}
