const express = require("express");
const { v4: uuid } = require("uuid");

const app = express();
app.use(express.json());

const costumers = [];

function verifyIfExistAccount(request, response, next) {
  const { cpf } = request.headers;

  const costumer = costumers.find((costumer) => costumer.cpf === cpf);

  if (!costumer) {
    return response.status(400).json({ error: "costumer not found!" });
  }

  request.costumer = costumer;

  return next();
}

app.post("/account", (request, response) => {
  /**
   * cpf - string
   * name - string
   * id - uuid
   * statement - []   # dados do cliente
   */
  let { cpf, name } = request.body;
  const id = uuid();

  cpf = String(cpf);
  const costumersAlreadyExists = costumers.some(
    (costumer) => costumer.cpf === cpf
  );

  if (costumersAlreadyExists) {
    return response.status(400).json({ error: "Costumer already exists!" });
  }

  costumers.push({
    id,
    cpf,
    name,
    statement: [],
  });

  response.status(201).json("created");
});

app.get("/statement", verifyIfExistAccount, (request, response) => {
  const { costumer } = request;
  return response.json(costumer.statement);
});

app.post("/deposit", verifyIfExistAccount, (request, response) => {
  const { description, amount } = request.body;

  const costumer = request.costumer;

  const statementOperation = {
    description,
    amount,
    create_at: new Date(),
    type: "credit",
  };

  costumer.statement.push(statementOperation);

  return response.status(201).json("done")
});

app.listen(3000, () => {
  console.log("running on http://localhost:3000");
});
