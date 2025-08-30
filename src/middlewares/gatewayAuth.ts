import { Request, Response, NextFunction, RequestHandler } from "express";

export const gatewayAuth: RequestHandler = (req: Request, res: Response, next: NextFunction): void => {
    const key = req.headers["x-gateway-key"];

    if (key !== process.env.GATEWAY_SECRET) {
        res.status(403).json({ error: "Forbidden: Only API Gateway allowed" });
        return;
    }

    next();
};
