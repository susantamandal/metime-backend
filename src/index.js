import dotenv from 'dotenv';
dotenv.config();

import logger from './logger/index.js';
import { server } from './server.js';
import { connectDatabase } from './db/index.js';

(async () => {
    try {
        await connectDatabase();
        server.listen(process.env.PORT || 5001, () => {
            console.log(`Server running on port: ${process.env.PORT}`);
            logger.info(`Server running on port: ${process.env.PORT}`);
        });
    } catch (error) {
        console.error(`Backend failure: ${error.message}`);
        logger.error(`Backend failure: ${error.message}`);
        process.exit(1);
    }
}
)()