import { EJSON } from 'bson';
import { Response } from 'express';
import { createLogger, CustomLogger } from "./logger.js";
import { IResponse, IResponseBody } from "../types/response.js";
import { ERROR_MESSAGES } from "../constants.js";


const logger: CustomLogger = createLogger({ fileName: "Response"});

/**
 * sending custom response
 * @param res
 * @param status
 * @param body
 */
export const customResponse = (
    res: Response,
    status: number,
    body: IResponseBody
): Response => {
    return res.status(status).send(
        safeParser<IResponseBody>({
            ...body,
            data: body?.data || {}
        })
    );
};

/**
 * send success response
 * @param resInfo
 */
export const successResponse = (
    resInfo: IResponse,
) => {
    logger.debug('Sending success response');
    return customResponse(
        resInfo.res,
        resInfo.status || 200,
        resInfo.body || {},
    );
};

/**
 * sending error response
 * @param resInfo
 */
export const failureResponse = (
        resInfo: IResponse,
) =>{
    logger.debug('Sending error response');
    return customResponse(
        resInfo.res,
        resInfo.status || 500,
        {
            ...resInfo.body,
            message: resInfo?.body?.message || ERROR_MESSAGES.UNEXPECTED_PROCESSING_ERROR
        }
    );
};

export const pendingConfirmationResponse = (
        resInfo: IResponse
) => {
    logger.debug(
        'Sending accepted response.Need to fulfill more actions to complete the main action.'
    );
    return customResponse(
        resInfo.res,
        resInfo.status || 202,
        resInfo.body || {}
    )
}

/**
 * safe parsing the response body
 */
export const safeParser = <T>(body: T): T => {
    return EJSON.parse(EJSON.stringify(body));
}