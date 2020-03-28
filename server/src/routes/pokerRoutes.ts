// /lib/routes/crmRoutes.ts
import {Request, Response, IRoute} from "express";
import express from "express";
import path from "path";

export class Routes {       
    public routes(app:any): void {   

        var htmlPath = path.resolve(__dirname + "./../../../client/dist/client/");        

        app.route('/').get(function (req:any, res:any) {
            res.status(200).sendFile(`/`, {root: htmlPath});
        });

        app.route('/session/*').get(function (req:any, res:any) {
            res.status(200).sendFile(`/`, {root: htmlPath});
        });

/*
        app.route('/')
        .get((req: Request, res: Response) => {            
            res.status(200).send({
                message: 'GET request successfulll!!!!'
            })
        })              
*/ 
    }
}