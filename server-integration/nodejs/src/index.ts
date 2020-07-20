import {Enforcer} from 'casbin';


/**
 * getPermissionForCasbinJs returns a string describing the permission of a given user.
 * You can pass the returned string to the frontend and manage your webpage widgets and APIs with Casbin.js.
 * The returned permission depends on `getImplicitPermissionsForUser`.
 * In other words, getPermissionForCasbinJs will load all of the explicit and implicit permission (role's permission).
 * @param e the initialized enforcer
 * @param user the user
 */
export async function getUserPermission(e : Enforcer, user: string): Promise<string> {
    const policies = await e.getImplicitPermissionsForUser(user);
    const permission: { [key: string]: string[] } = {};
    policies.forEach(policy => {
      if (!(policy[2] in permission)) {
        permission[policy[2]] = [];
      }
      if (!permission[policy[2]].includes(policy[1])) {
        permission[policy[2]].push(policy[1]);
      }
    });
    const permString = JSON.stringify(permission);
    return permString;
}