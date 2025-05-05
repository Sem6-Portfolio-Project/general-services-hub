import { Response } from 'express';
import { NativeAttributeValue } from '@aws-sdk/util-dynamodb';

export interface IResponse {
    res: Response;
    status?: number;
    body?: IResponseBody
}

export interface IResponseBody {
    data?: NativeAttributeValue ,
    message?: string
}