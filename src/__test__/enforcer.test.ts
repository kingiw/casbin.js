import * as casbin from "casbin"

const s: string = `[request_definition]
r = sub, obj, act

[policy_definition]
p = sub, obj, act

[policy_effect]
e = some(where (p.eft == allow))

[matchers]
m = r.sub == p.sub && r.obj == p.obj && r.act == p.act
`
const respData = JSON.stringify({
    m: s,
    p: [
        ["p", "alice", "data1", "read"],
        ["p", "bob", "data1", "write"]
    ]
});

test('Load casbin from strings.', async () => {
    const m = casbin.newModelFromString(s);
    const e = await casbin.newEnforcer(m);
    
    e.addPolicy("alice", "data1", "read");
    expect(await e.enforce("alice", "data1", "read")).toBe(true);
    expect(await e.enforce("alice", "data1", "write")).toBe(false);
})



