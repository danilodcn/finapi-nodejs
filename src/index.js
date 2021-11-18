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

function getBalance(statement) {
  const balance = statement.reduce((acc, operation) => {
    if (operation.type === "credit") {
      return acc + operation.amount;
    }

    if (operation.type === "debit") {
      return acc - operation.amount;
    }
  }, 0);

  return balance;
}

app.get("/", (request, response) => {
  response.json("ola mundo!!")
})

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

  return response.status(201).json("done");
});

app.post("/withdraw", verifyIfExistAccount, (request, response) => {
  const { amount } = request.body;
  const { costumer } = request;

  const balance = getBalance(costumer.statement);

  if (balance < amount) {
    return response
      .status(400)
      .json({ error: "operation not possible", msg: `Insufficient founds!` });
  }

  const statementOperation = {
    amount,
    create_at: new Date(),
    type: "debit",
  };

  costumer.statement.push(statementOperation);
  response.status(201).json("done");
});

app.get("/statement/date", verifyIfExistAccount, (request, response) => {
  const { costumer } = request;
  const { date } = request.query;

  const dateFormat = new Date(date + "00:00");

  const statement = costumer.statement.filter((statement) => {
    return (
      statement.create_at.toDateString() >= new Date(dateFormat).toDateString()
    );
  });
  return response.json(statement)
});

app.listen(3000, () => {
  console.log("running on http://localhost:3000");
});
