# Casbin.js Server Integration for Casbin-Node

If you are using [Casbin.js](https://github.com/casbin/casbin.js) at your frontend and [Node-Casbin](https://github.com/casbin/node-casbin) as your backend Casbin service, you can install this package at your backend. This package provides a wrapper for generating the user permission, which can be passed to Casbin.js at the frontend.

### Installation
```
npm install --save @casbinjs/node-server-integration
# or
yarn add @casbinjs/node-server-integration
```

### Example
```javascript
import {getUserPermission} from '@casbinjs/node-server-integration'

// In your Restful API
private async setRouter(): Promise<void> {
    this.app.get('/api/casbin', async (req: express.Request, res: express.Response) => {
        // Get the user identity from URL.
        const user = String(req.query["casbin_user"]);
        // Generate the valid permission string. You need to inialize a Casbin enforcer before calling the `getUserPermission` 
        const permission = await getUserPermission(enforcer, user);
        res.status(200).json({
            message: 'ok',
            data: permission
        })
    })
}
```