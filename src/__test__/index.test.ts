import { removeLocalStorage } from '../Cache';
import TestServer from './server';
import fetch from 'node-fetch';
import * as casbin from 'casbin';
import Authorizer from '../Authorizer';

describe('Unit testing', () => {
    let server: TestServer;
    beforeAll(async () => {
        server = new TestServer();
        await server.start();
    });

    test('Request for /api/casbin', async () => {
        const response = await fetch('http://localhost:4000/api/casbin?casbinjs_sub=alice', {
            method: 'GET',
        });
        const respJson = await response.json();
        if (respJson.message !== 'ok') {
            throw Error(`response not ok, message: ${respJson.message}`);
        }

        const profile = JSON.parse(respJson['data']);
        const requestDef: string = profile.r;
        const policyDef: string = profile.p;
        const policyEff: string = profile.e.split('_').join('.');
        // not support for ABAC currently
        const matchers: string = profile.m.split('_').join('.');
        const policies: string[] = profile.ps.split('\n');
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
        console.log(modelConfStr);
        expect(requestDef).toBe('sub, obj, act');
        expect(policyDef).toBe('sub, obj, act');
        expect(policyEff).toBe('some(where (p.eft == allow))');
        expect(matchers).toBe('m = r.obj == p.obj && r.act == p.act');

        const m = casbin.newModelFromString(modelConfStr);
        const e = await casbin.newEnforcer(m);

        policies.forEach(async (policy) => {
            await e.addPolicy(...policy.split(',').slice(1, 4));
        });
        expect(await e.enforce('alice', 'data1', 'read')).toBe(true);
        expect(await e.enforce('alice', 'data1', 'write')).toBe(false);
        expect(await e.enforce('alice', 'data2', 'read')).toBe(true);
        expect(await e.enforce('alice', 'data2', 'write')).toBe(true);
        expect(await e.enforce('alice', 'non-exist', 'write')).toBe(false);
    });

    test('Authorizer connects to svr', async () => {
        removeLocalStorage('alice');
        const authorizer = new Authorizer();
        authorizer.setup('http://localhost:4000/api/casbin?casbinjs_sub=alice', 'alice');
        expect(await authorizer.can('read', 'data1')).toBe(true);
        expect(await authorizer.can('write', 'data1')).toBe(false);
        expect(await authorizer.can('read', 'data2')).toBe(true);
        expect(await authorizer.can('write', 'data2')).toBe(true);
        expect(await authorizer.can('read', 'non-exist')).toBe(false);
        expect(await authorizer.canAll('read', ['data1', 'data2'])).toBe(true);
        expect(await authorizer.canAll('write', ['data1', 'data2'])).toBe(false);
        expect(await authorizer.canAny('read', ['data1', 'data2'])).toBe(true);
        expect(await authorizer.canAny('write', ['data1', 'data2'])).toBe(true);
        expect(await authorizer.canAny('write', ['non-exist'])).toBe(false);
        expect(await authorizer.canAll('write', ['non-exist'])).toBe(false);

        // canAny & canAll will return true with empty object list
        expect(await authorizer.canAny('write', [])).toBe(true);
        expect(await authorizer.canAll('write', [])).toBe(true);
    });

    afterAll(() => server.terminate());
});
