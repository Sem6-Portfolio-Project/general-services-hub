import express,{ Router } from "express";

export abstract class BaseRouter {
    protected router: Router;
    private routesInitialized: boolean = false;

    protected constructor() {
        this.router = express.Router();
    }

    protected abstract initRoutes: () => void;

    public getRoutes = (): Router =>{
        if(!this.routesInitialized){
            this.initRoutes();
            this.routesInitialized = true;
        }
        return this.router;
    }
}