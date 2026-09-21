import { Router } from "express";
import { verifyJwt } from "../middelware/auth.middelware.js";
import {
    getSubscribedChannels , 
    getUserChannelSubscribers ,
    toggleSubscription ,
} from '../controllers/subscription.controller.js';


const router = Router();

router.use(verifyJwt) ;

router.route("/c/:channelId").get(getUserChannelSubscribers).post(toggleSubscription);

router.route("/subscribed").get(getSubscribedChannels)






export default router ;
