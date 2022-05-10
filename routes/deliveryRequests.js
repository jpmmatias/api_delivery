import express from 'express';
import fs from 'fs/promises';

const deliveryRequestsRouter = express.Router();

deliveryRequestsRouter.get('/requests', async (req, res) => {
	const requests = await getRequests();
	return res.json({ requests });
});

deliveryRequestsRouter.get('/requests/:id', async (req, res) => {
	const requests = await getRequests();
	const id = req.params.id;

	const request = requests.pedidos.find((pedido) => pedido.id === Number(id));
	return res.json({ request }).status(200);
});

deliveryRequestsRouter.post('/requests/sumrequests', async (req, res) => {
	const requests = await getRequests();
	const { cliente } = req.body;

	const all_requests = requests.pedidos.filter(
		(pedido) => pedido.cliente === cliente && pedido.entregue === true
	);

	console.log(all_requests);
	const sum_requests = all_requests.reduce(function (acumulador, pedido) {
		return acumulador + pedido.valor;
	}, 0);

	return res.json({ valor_total: sum_requests }).status(200);
});

deliveryRequestsRouter.post(
	'/requests/productsumrequests',
	async (req, res) => {
		const requests = await getRequests();
		const { produto } = req.body;

		const all_requests = requests.pedidos.filter(
			(pedido) => pedido.produto === produto && pedido.entregue === true
		);

		const sum_requests = all_requests.reduce(function (acumulador, pedido) {
			return acumulador + pedido.valor;
		}, 0);

		return res.json({ valor_total: sum_requests }).status(200);
	}
);

deliveryRequestsRouter.post('/requests', async (request, response) => {
	const requests = await getRequests();

	const body = request.body;

	const deliveryRequest = {
		id: requests.nextId,
		cliente: body.cliente,
		produto: body.produto,
		valor: body.valor,
		entregue: false,
		timestamp: new Date(),
	};

	try {
		await createRequest(deliveryRequest);
		return response.status(201).send();
	} catch (error) {
		console.log(error);
	}
});

deliveryRequestsRouter.put('/requests/:id', async (request, response) => {
	const id = request.params.id;
	const body = request.body;

	const deliveryRequest = {
		cliente: body.cliente,
		produto: body.produto,
		valor: body.valor,
		entregue: body.entregue,
	};

	try {
		await updateRequest(deliveryRequest, id);
		return response.status(204).send();
	} catch (error) {
		console.log(error);
	}
});

deliveryRequestsRouter.put(
	'/requests/delivered/:id',
	async (request, response) => {
		const id = request.params.id;
		const body = request.body;

		const deliveryRequest = {
			entregue: body.entregue,
		};

		try {
			await updateRequestDelivred(deliveryRequest, id);
			return response.status(204).send();
		} catch (error) {
			console.log(error);
		}
	}
);

deliveryRequestsRouter.delete('/requests/:id', async (request, response) => {
	const id = request.params.id;

	try {
		await deleteDelivred(id);
		return response.status(204).send();
	} catch (error) {
		console.log(error);
	}
});

export { deliveryRequestsRouter };

async function getRequests() {
	try {
		const data = await fs.readFile('./pedidos.json');
		return JSON.parse(data);
	} catch (error) {
		console.log(error);
	}
}

async function createRequest(request) {
	let fileContents = await fs.readFile('./pedidos.json', {
		encoding: 'utf8',
	});

	fileContents = JSON.parse(fileContents);

	fileContents.nextId = fileContents.nextId + 1;
	fileContents.pedidos.push(request);

	await fs.writeFile('./pedidos.json', JSON.stringify(fileContents, null, 2), {
		encoding: 'utf8',
	});
}

async function updateRequest(request, id) {
	let fileContents = await fs.readFile('./pedidos.json', {
		encoding: 'utf8',
	});

	fileContents = JSON.parse(fileContents);
	fileContents.pedidos.forEach((pedido) => {
		if (pedido.id === Number(id)) {
			pedido.cliente = request.cliente ? request.cliente : pedido.cliente;
			pedido.valor = request.valor ? request.valor : pedido.valor;
			pedido.entregue = request.entregue ? request.entregue : pedido.entregue;
			pedido.produto = request.produto ? request.produto : pedido.produto;
		}
	});

	await fs.writeFile('./pedidos.json', JSON.stringify(fileContents, null, 2), {
		encoding: 'utf8',
	});
}

async function updateRequestDelivred(request, id) {
	let fileContents = await fs.readFile('./pedidos.json', {
		encoding: 'utf8',
	});

	fileContents = JSON.parse(fileContents);
	fileContents.pedidos.forEach((pedido) => {
		if (pedido.id === Number(id)) {
			pedido.entregue = request.entregue;
		}
	});

	await fs.writeFile('./pedidos.json', JSON.stringify(fileContents, null, 2), {
		encoding: 'utf8',
	});
}

async function deleteDelivred(id) {
	let fileContents = await fs.readFile('./pedidos.json', {
		encoding: 'utf8',
	});

	fileContents = JSON.parse(fileContents);
	fileContents.pedidos = fileContents.pedidos.filter(
		(pedido) => pedido.id !== Number(id)
	);
	await fs.writeFile('./pedidos.json', JSON.stringify(fileContents, null, 2), {
		encoding: 'utf8',
	});
}
