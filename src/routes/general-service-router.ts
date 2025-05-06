import { BaseRouter } from "./base-router.js";
import { NotificationController } from "../controllers/notification-controller.js";
import { LostFoundItemController } from "../controllers/lostfound-item-controller.js";
import { injectable } from "tsyringe";


@injectable()
export class GeneralServiceRouter extends BaseRouter {

  constructor(
    private notificationController: NotificationController,
    private lostFoundItemController: LostFoundItemController
  ) {
    super();
  }

  protected initRoutes = (): void => {

  }
}
