
// export const catchAsyncErrors : RequestHandler = () => (req: Request, res: Response, next: NextFunction) => {
//     Promise.resolve(catchAsyncErrors(req, res, next))
//         .catch(next)
// }

//#region Common JS Method

module.exports = Func => (req, res, next) => {
    Promise.resolve(Func(req, res, next)).catch(next);
}

//#endregion