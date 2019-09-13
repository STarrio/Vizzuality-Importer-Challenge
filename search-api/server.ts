import express from 'express';
import { router } from './router';
const app = express()
const port = 6200

// Set up the router
app.use('/search', router)

// Bootstrap the app
app.listen(port, () => console.log(`Listening on port ${port}!`))
