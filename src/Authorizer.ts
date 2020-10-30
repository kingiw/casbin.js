import axios from 'axios';
import * as casbin from 'casbin';
import * as Cache from './Cache';

interface BaseResponse {
    message: string;
    data: any;
}

export default class Authorizer {
    private _endpoint!: string;
    private _casbinModel!: casbin.Model;
    private _casbinEnforcer!: casbin.Enforcer;
    private _enforcerInit = false;

    async setup(endpoint: string, user: string) {
        this._endpoint = endpoint;
        let profile = Cache.loadFromLocalStorage(user);
        if (profile === '') {
            profile = await this.fetchProfile(user);
            Cache.saveToLocalStorage(user, profile, 3600);
        }
        await this.initEnforcer(profile);
    }

    public async fetchProfile(user: string): Promise<string> {
        if (this._endpoint === undefined || this._endpoint === null) {
            throw Error('Endpoint not specified');
        }
        const resp = await axios.get<BaseResponse>(`${this._endpoint}?casbin_subject=${user}`);
        return resp.data.data; // profile
    }

    public async initEnforcer(profile: string) {
        const profileJson = JSON.parse(profile);
        const requestDef: string = profileJson.r;
        const policyDef: string = profileJson.p;
        const policyEff: string = profileJson.e.split('_').join('.');
        // not support for ABAC currently
        const matchers: string = profileJson.m.split('_').join('.');
        const policies: string[] = profileJson.ps.split('\n');
        const modelConfStr = [
            '[request_definition]',
            `r = ${requestDef}`,
            '[policy_definition]',
            `p = ${policyDef}`,
            '[policy_effect]',
            `e = ${policyEff}`,
            '[matchers]',
            `${matchers}`,
        ].join('\n');
        this._casbinModel = casbin.newModelFromString(modelConfStr);
        this._casbinEnforcer = await casbin.newEnforcer(this._casbinModel);

        policies.forEach(async (policy) => {
            await this._casbinEnforcer.addPolicy(...policy.split(',').slice(1, 4));
        });
        this._enforcerInit = true;
    }

    public async can(action: string, object: string): Promise<boolean> {
        if (this._enforcerInit) {
            return await this._casbinEnforcer.enforce('_', action, object);
        } else {
            // Authorizer not init
            return false;
        }
    }

    public async cannot(action: string, object: string): Promise<boolean> {
        return await this.can(action, object);
    }

    public async canAny(action: string, objects: string[]): Promise<boolean> {
        for (let i = 0; i < objects.length; ++i) {
            if (await this.can(action, objects[i])) {
                return true;
            }
        }
        return false;
    }

    public async canAll(action: string, objects: string[]): Promise<boolean> {
        for (let i = 0; i < objects.length; ++i) {
            if (await this.can(action, objects[i])) {
                return true;
            }
        }
        return false;
    }
}
