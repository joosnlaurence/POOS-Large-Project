/* Responsible for starting up our application and server */ 

import { createApp, setupDatabase } from './app.js'

async function start() {
    try {
        const db = await setupDatabase();
        const app = createApp(db);

        const PORT = 5000;
        // In case we want to make our PORT a secret later
        // const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            console.log(`Main server running on port ${PORT}`);
        });
        
    } 
    catch(err) {
        console.error("Error starting server: ", err);
        process.exit(1);
    }
}

start();
