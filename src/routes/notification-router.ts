import { BaseRouter } from "./base-router.js";
import { NotificationController } from "../controllers/notification-controller.js";
import { injectable } from "tsyringe";

@injectable()
export class NotificationRouter extends BaseRouter {

  constructor(
    private notificationController: NotificationController
  ) {
    super();
  }

  protected initRoutes = (): void => {

  }
}
