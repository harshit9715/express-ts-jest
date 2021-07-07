import dotenv from "dotenv";
import express from "express";
import * as egRoutes from './routes/example';

// initialize configuration
dotenv.config(process.env.NODE_ENV!='development'?{}:{
    debug: true,
});


const port = process.env.SERVER_PORT; // default port to listen
const app = express();

// Example routes
egRoutes.register(app)

// start the Express server
app.listen( port, () => {
    // tslint:disable-next-line:no-console
    console.log( `server started at http://localhost:${ port }` );
} );