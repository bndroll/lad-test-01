import express from 'express';
import dotenv from 'dotenv';
import path from 'app-root-path';
import * as fs from 'fs';


dotenv.config();

const app = express();

app.get('/file/:name', async (req, res) => {
    const stream = fs.createReadStream(`${path.path}/server/files/${req.params.name}`);
    res.contentType('text/csv');
    stream.pipe(res);
});

app.listen(process.env.SERVER_PORT, () => {
    console.log('server running');
});