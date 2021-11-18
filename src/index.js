const express = require("express");
const { v4: uuid } = require("uuid");

const app = express();
app.use(express.json());

const costumers = [];

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

  response.status(201).json("criado");
});

app.get("/statement/:cpf", (request, response) => {
  const { cpf } = request.params;

  const costumer = costumers.find((costumer) => costumer.cpf === cpf);

  if (!costumer) {
    return response.status(400).json({error: "costumer not found!"})
  }

  return response.json(costumer.statement);
});

app.listen(3000, () => {
  console.log("running on http://localhost:3000");
});
