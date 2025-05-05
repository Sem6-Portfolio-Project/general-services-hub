import "reflect-metadata";
import { Express } from "express";
import { container } from "tsyringe";
import serverless from "serverless-http";
import { getApp } from "../../lib/express-app.js";
import { NotificationRouter } from "../../routes/notification-router";
import {
    APIGatewayProxyEvent,
    APIGatewayProxyHandler,
    APIGatewayProxyResult,
    Context
} from 'aws-lambda';


const app: Express = getApp();

app.use('/notification', container.resolve(NotificationRouter).getRoutes());

const _handler: serverless.Handler = serverless(app);

export const handler: APIGatewayProxyHandler = async (
        event: APIGatewayProxyEvent,
        context: Context
): Promise<APIGatewayProxyResult> =>{
    return (await _handler(event,context)) as APIGatewayProxyResult;
}
