import {newEnforcer} from 'casbin';
import {getUserPermission} from '../index';

test('Test getUserPermission', async() => {
    const e = await newEnforcer('src/__test__/rbac_model.conf', 'src/__test__/rbac_with_hierarchy_policy.csv');
    let permStr = await getUserPermission(e, 'alice');
    let perm = JSON.parse(permStr);
    expect(perm['read']).toContain('data1');
    expect(perm['write']).toContain('data1');
    expect(perm['read']).toContain('data2');
    expect(perm['write']).toContain('data2');
  
    permStr = await getUserPermission(e, 'bob');
    perm = JSON.parse(permStr);
    expect(perm['write']).toContain('data2');
    expect(perm['write']).not.toContain('data1');
    expect(perm['read']).not.toBeNull;
    expect(perm['rm_rf']).toBeNull;
})