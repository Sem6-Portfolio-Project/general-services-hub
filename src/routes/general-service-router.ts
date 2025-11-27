import { BaseRouter } from "./base-router.js";
import { NotificationController } from "../controllers/notification-controller.js";
import { LostFoundItemController } from "../controllers/lostfound-item-controller.js";
import { injectable } from "tsyringe";
import { UtilsController } from "../controllers/utilities-controller.js";


@injectable()
export class GeneralServiceRouter extends BaseRouter {

  constructor(
    private notificationController: NotificationController,
    private lostFoundItemController: LostFoundItemController,
    private utilsController: UtilsController
  ) {
    super();
  }

  protected initRoutes = (): void => {
    this.router.post('/register-device', this.notificationController.registerDevice);
    this.router.post('/lost-found/item', this.lostFoundItemController.postLostOrFoundItem);
    this.router.get('/lost-found/item', this.lostFoundItemController.getLostOrFoundItem);
    this.router.get('/lost-found/items', this.lostFoundItemController.getLostOrFoundItems);
    this.router.delete('/lost-found/item', this.lostFoundItemController.deleteLostFoundItem);
    this.router.post('/utils/presigned/upload',this.utilsController.getDocumentUplaodUrls)
  }
}
