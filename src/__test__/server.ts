import * as http from 'http';
import express from 'express';
import CasbinServerTool from 'casbinjs-server-tool';
import * as casbin from 'casbin';

class TestServer {
    private app: express.Application;
    private port = 4000;
    private listener!: http.Server;
    private enforcer!: casbin.Enforcer;
    private svrTool!: CasbinServerTool;
    public constructor(port?: number) {
        if (port) {
            this.port = port;
        }
        this.app = express();
    }

    private setRouter(): void {
        this.app.get('/', (req: express.Request, res: express.Response) => {
            res.status(200).json({
                message: 'ok',
                data: 'this is the data',
            });
        });
        this.app.get('/api/casbin', async (req: express.Request, res: express.Response) => {
            const sub = String(req.query['casbinjs_sub']);
            const profile = await this.svrTool.genJsonProfile(sub);
            res.status(200).json({
                message: 'ok',
                data: profile,
            });
        });
    }

    public async start(): Promise<void> {
        this.enforcer = await casbin.newEnforcer('./src/__test__/examples/basic_model.conf', './src/__test__/examples/basic_policy.csv');
        this.svrTool = new CasbinServerTool(this.enforcer);
        this.setRouter();
        this.listener = this.app.listen(this.port, () => console.log(`Express server is listening at http://localhost:${this.port}`));
    }

    public terminate(): void {
        this.listener.close();
        console.log('Express server is terminated');
    }
}

export default TestServer;
