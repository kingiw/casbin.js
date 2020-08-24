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
    public mode!: Mode;
    public endpoint: string | undefined = undefined;
    public permission: Permission | undefined;
    public cookieKey : string | undefined = undefined;
    public cacheExpiredTime  = 60; // Seconds
    public user : string | undefined;
    public enforcer:casbin.Enforcer | undefined;

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
    constructor(mode: Mode = "manual", args: {endpoint?: string, /*cookieKey?: string,*/ cacheExpiredTime?: number} = {}) {
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
            throw Error("Cookie mode not implemented.");
            /*
            this.mode = mode;
            const permission = Cookies.get(args.cookieKey ? args.cookieKey : "casbin_perm");
            if (permission) {
                this.setPermission(permission);
            } else {
                console.log("WARNING: No specified cookies");
            }
            */
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
        if (this.permission !== undefined) {
            return this.permission?.getPermissionJsonObject();
        } else {
            console.log("Error: Permission is not defined. Are you using manual mode and have set the permission?");
            return {} as StringKV;
        }
    }

    public setPermission(permission : Record<string, unknown> | string) : void{
        if (this.permission === undefined) {
            this.permission = new Permission();
        }
        this.permission.load(permission);
    }
    
    public async initEnforcer(s: string): Promise<void> {
        const obj = JSON.parse(s);
        if (!('m' in obj)) {
            console.log("Error: No model when init enforcer.");
        }
        const m = casbin.newModelFromString(obj['m']);
        this.enforcer = await casbin.newEnforcer(m);
        if ('p' in obj) {
            for (let sArray of obj['p']) {
                this.enforcer.addPolicy(sArray[1].trim(), sArray[2].trim(), sArray[3].trim());
            }
        }
    }

    /**
     * Initialize the enforcer
     */
    public async getEnforcerDataFromSvr(): Promise<string>{
        if (this.endpoint === undefined || this.endpoint === null) {
            throw Error("Endpoint is null or not specified.");
        }
        const resp = await axios.get<BaseResponse>(`${this.endpoint}?casbin_subject=${this.user}`);
        return resp.data.data;
    }

    /**
     * Set the user subject for the authroizer
     * @param user The current user
     */
    public async setUser(user : string) : Promise<void> {
        if (this.mode == 'auto' && user !== this.user) {
            this.user = user;
            const cachedConfig = Cache.loadFromLocalStorage(user);
            if (cachedConfig === null) {
                const config = await this.getEnforcerDataFromSvr();
                await this.initEnforcer(config);
                Cache.saveToLocalStorage(user, config, this.cacheExpiredTime);
            } else {
                this.initEnforcer(cachedConfig);
            }
        }
    }

    public async can(action: string, object: string): Promise<boolean> {
        if (this.mode == "manual") {
            return this.permission !== undefined && this.permission.check(action, object);
        } else if (this.mode == "auto") {
            if (this.enforcer === undefined) {
                throw Error("Enforcer not initialized");
                return false;
            } else {
                return await this.enforcer.enforce(this.user, object, action);
            }
        } else {
            throw Error(`Mode ${this.mode} not recognized.`);
        }
    }

    public async cannot(action: string, object: string): Promise<boolean> {
        return !(await this.can(action, object));
    }

    public async canAll(action: string, objects: string[]) : Promise<boolean> {
        for (let i = 0; i < objects.length; ++i) {
            if (await this.cannot(action, objects[i])) {
                return false;
            }
        }
        return true;
    }

    public async canAny(action: string, objects: string[]) : Promise<boolean> {
        for (let i = 0; i < objects.length; ++i) {
            if (await this.can(action, objects[i])) {
                return true;
            }
        }
        return false;
    }

}
