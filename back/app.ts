import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';

const app: Express = express();
const port = 3000;

app.use(cors());

app.use(express.static('build/public'));

app.get('/', (req: Request, res: Response, next: NextFunction) => {
    res.sendFile('index.html', { root: 'build/public' });
});

app.listen(port, () => {
    console.log(`Express server is running on port ${port}.`);
});
