import dotenv from 'dotenv';
dotenv.config()

import { server } from './server.js';
import { connectDatabase } from './db/index.js';

(async () => {
    try {
        await connectDatabase();
        server.listen(process.env.PORT || 5001, () => {
            console.log(`Server running on port: ${process.env.PORT}`);
        });
    } catch (error) {
        console.error(`Backend failure: ${process.env.PORT}`);
    }
}
)()





// import express from 'express';
// import bodyParser from 'body-parser';
// import mongoose from 'mongoose';
// import cors from 'cors';

// import logger from './logger/logger.js';

// import userRouter from './routers/user.js'
// import authRouter from './routers/auth.js'
// import postRouter from './routers/post.js'


// const app = express();

// app.use(bodyParser.json({ limit: '30mb', extended: true }));
// app.use(bodyParser.urlencoded({ limit: '30mb', extended: true }));
// app.use(cors());
// app.use('/metaserver/user-service', userRouter);
// app.use('/metaserver/auth-service', authRouter);
// app.use('/metaserver/post-service', postRouter);


// logger.info('Server initiating...');
// mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
//     .then(() => app.listen(process.env.PORT, () => logger.info(`Server running on port:${process.env.PORT}`)))
//     .catch((error) => logger.error(error.message));