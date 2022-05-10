import express from 'express';
import { deliveryRequestsRouter } from './routes/deliveryRequests.js';

const app = express();
app.use(express.json());

app.use(deliveryRequestsRouter);

app.listen(5000, () => {
	console.log('Server is listening at port 5000');
});
