import { Router } from'express';
import { 
    addComment ,
    deleteComment ,
    getVideoComment ,
    updateComment ,
    addReply,
} from '../controllers/comment.controller.js';
import { verifyJwt } from '../middelware/auth.middelware.js';
import { optionalVerifyJwt } from '../middelware/optionalVerifyJwt.js';

const router = Router();



router.route("/:videoId").get( optionalVerifyJwt , getVideoComment).post(verifyJwt , addComment);
router.route("/:videoId/:commentId/reply").post(verifyJwt , addReply);
router.route("/c/:commentId").delete(verifyJwt , deleteComment).patch(verifyJwt , updateComment);

export default router ;
