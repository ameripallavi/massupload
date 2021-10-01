const express = require("express");
const app = express();
const cors = require("cors");
const pool = require("./database");
const { response } = require("express");

//middleware

app.use(cors());
app.use(express.json());

//Routes

app.use(cors());

app.post("/todos", async (req, res) => {
  try {
    const data = req.body.body.data;
    var countInserted = 0;
    var countConflict = 0;
    var email = [];
    var flag = 0;
    let record = await pool.query("SELECT email FROM public.data");
    for (let i = 0; i < record.rows.length; i++) {
      email.push(record.rows[i].email);
    }

    for (let i = 0; i < data.length; i++) {
      if (!email.includes(data[i].email)) {
        console.log(data[i].email);
        flag = i;
        let data_id = await pool.query(
          "SELECT max(id)+1 as id FROM public.data"
        );
        var id = data_id.rows[0].id;
        const newTodo = await pool.query(
          "INSERT INTO data (id,firstname,lastname,address,zipcode,email) VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email returning id",
          (values = [
            parseInt(id) ? parseInt(id) : 1,
            data[i].firstName,
            data[i].lastName,
            data[i].address,
            data[i].zipcode,
            data[i].email,
          ])
        );
        countInserted++;
      } else {
        countConflict++;
      }
    }

    if (res) {
      let response = {};
      response.countInserted = countInserted;
      response.countConflict = countConflict;
      res.send(response);
      //res.status(200).end();
    }
  } catch (err) {
    //console.error(err.message);
    if (err) {
      let response = {};
      response.countInserted = countInserted;
      response.countConflict = countConflict;
      response.atLineNo = flag;
      response.messasge = err.message;
      //   res.status(400).send('inserted rows are:'+[count]+' '+ err.message);
      res.status(400).send(response);
      //res.status(400).send(err.message);
    }
  }
});

//get all todos

app.get("/todos", async (req, res) => {
  try {
    const allTodos = await pool.query("SELECT * FROM data");
    res.json(allTodos.rows);
  } catch (err) {
    console.log(err.message);
  }
});

//get a todo

app.get("/todos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const todo = await pool.query("SELECT * FROM data WHERE id = $1", [id]);
    res.json(todo.rows[0]);
  } catch (err) {
    console.log(err.message);
  }
});

// update a todo

app.put("/todos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.body;
    const updateTodo = await pool.query(
      "UPDATE data SET email =$1 WHERE id = $2",
      [email, id]
    );

    req.json("todao data is upadated");
  } catch (err) {
    console.log(err.message);
  }
});

//delete a todo

app.delete("/todos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleteTodo = await pool.query("DELETE FROM data WHERE id = $1", [id]);

    res.json("Todo was deleted");
  } catch (err) {
    console.log(err.message);
  }
});

app.listen(3001, () => {
  console.log("server has started on port 3001");
});
