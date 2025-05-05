import { SPLAT } from "triple-beam";
import winston, { format, transports, Logger } from "winston";
import { FormatWrap, TransformableInfo, Format } from "logform";

export type CustomLogger = Logger;
export type LoggerOption = {
    fileName: string;
};

const printer: Format = format.printf(
        (Info: TransformableInfo): string =>
                `${Info.timestamp} ${(Info[Symbol.for('level')]as string).toUpperCase()} ${Info.fileName} - ${Info.message}`
);

const errorFinder: FormatWrap =format(
        (Info: TransformableInfo): TransformableInfo => {
            if(Info.error) {
                return Info
            }
            const splat = Info[SPLAT] as Array<object> || [];
            Info.error = splat.find((obj: object): boolean => obj instanceof Error);
            return Info;
        }
)

const errorFormatter: FormatWrap = format(
        (Info: TransformableInfo): TransformableInfo => {
            if (!Info.error) {
                return Info;
            }
            const errorMsg = (Info.error as Error).stack || Info.error.toString();
            Info.message += `\n${errorMsg}`;
            return Info;
        },
);

const _logger: Logger = winston.createLogger({
    level: "debug",
    format: format.combine(
            format.colorize({level: true}),
            format.errors({ stack: true}),
            errorFinder(),
            errorFormatter(),
            format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
            format.splat(),
            printer
    ),
    transports: [new transports.Console()],
    exitOnError: false,
});

export const createLogger = (loggerOption: LoggerOption): CustomLogger => {
    return _logger.child(loggerOption);
};