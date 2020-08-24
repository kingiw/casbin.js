import * as casbin from "casbin";

// export default class Enforcer {
//     private e!: casbin.Enforcer;
    
//     public async init(modelStr: string, policies: string[][]) {
//         const m = casbin.newModelFromString(modelStr);
//         this.e = await casbin.newEnforcer(m);
//         this.e.addPolicies(policies);
//     }
// }

// export default class Enforcer extends casbin.Enforcer {
//     constructor
// }