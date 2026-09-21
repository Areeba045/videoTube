import { Router } from'express';
import { 
    addComment ,
    deleteComment ,
    getVideoComment ,
    updateComment ,
} from '../controllers/comment.controller.js';
import { verifyJwt } from '../middelware/auth.middelware.js';

const router = Router();



router.route("/:videoId").get(getVideoComment).post(verifyJwt , addComment);
router.route("/c/:commentId").delete(verifyJwt , deleteComment).patch(verifyJwt , updateComment);

export default router ;
