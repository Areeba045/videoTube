import express, { urlencoded } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';



const app = express();

app.use(cors({
    origin : 'http://localhost:5173' ,
    credentials : true ,
}));

app.use(express.json({ limit : "16kb"}));

app.use(urlencoded({ extended :  true ,
    limit : '16kb' ,
}));

app.use(express.static("public"));

app.use(cookieParser());


//import routers
import userRouter  from './router/user.router.js'
import videoRouter from './router/video.router.js';
import subscriptionRouter from './router/subscription.router.js';
import commentRouter from './router/comment.router.js';
import likeRouter from './router/like.router.js';
import playlistRouter  from './router/playlist.router.js';


app.get("/" , (req , res) => {
    res.send("Route is Healthy !")
})
app.use("/api/v1/users" , userRouter);
app.use("/api/v1/videos" , videoRouter);
app.use("/api/v1/subscriptions" , subscriptionRouter) ;
app.use("/api/v1/comments" , commentRouter);
app.use("/api/v1/likes" , likeRouter);
app.use("/api/v1/playlist" , playlistRouter);


//http:localhost:3000/api/v1/users/register 

export default app ;
