const express = require("express");
const {Pool} = require("pg")
const app = express();

app.use(express.json());
app.use(express.urlencoded({extended:false}))

//export DATABASE_URL=postgres://cyf23:4xxkGZlE@database-1.c7jkbbjyxtpj.us-east-1.rds.amazonaws.com:5432/cyf23

// const pool = new Pool(
//  { 
//    user: 'cyf23',
//    host: 'database-1.c7jkbbjyxtpj.us-east-1.rds.amazonaws.com', 
//    database: 'cyf23',
//    password: '4xxkGZlE',
//    port: 5432
//  }
// );
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized:false,
  }
})
app.get("/hotels", (req, res) => {
  pool
    .query("SELECT * FROM hotels")
    .then((result) => res.json(result.rows))
    .catch((error) => {
      console.error(error);
      res.status(500).json(error);
    });
});

app.post("/hotels", function (req, res) {
  const newHotelName = req.body.name;
  const newHotelRooms = req.body.rooms;
  const newHotelPostcode = req.body.postcode;
  console.log(req.body)
  if (!Number.isInteger(newHotelRooms) || newHotelRooms <= 0) {
    return res
      .status(400)
      .send("The number of rooms should be a positive integer. Found " + req.body);
  }

  pool
    .query("SELECT * FROM hotels WHERE name=$1", [newHotelName])
    .then((result) => {
      if (result.rows.length > 0) {
        return res
          .status(400)
          .send("An hotel with the same name already exists!");
      } else {
        const query =
          "INSERT INTO hotels (name, rooms, postcode) VALUES ($1, $2, $3)";
        pool
          .query(query, [newHotelName, newHotelRooms, newHotelPostcode])
          .then(() => res.send("Hotel created!"))
          .catch((error) => {
            console.error(error);
            res.status(500).json(error);
          });
      }
    });
});

app.get("/customers/:customerId", (req, res) => {
  const { customerId } = req.params;
  return pool
    .query("SELECT * FROM customers WHERE id = $1", [customerId])
    .then((result) => res.send(result.rows))
    .catch((error) => console.log(error));
});

app.put("/customers/:customerId", function (req, res) {
    const customerId = req.params.customerId;
    const newEmail = req.body.email;
    const newName = req.body.name;
    const newAddress = req.body.address;
    const newCity = req.body.city;
    const newPostCode = req.body.postcode;
    const newCountry = req.body.country
    if(!newEmail){
        res.status(400).send("Enter a valid email");
    }
    pool
        .query("UPDATE customers SET email=$1, name=$2  WHERE id=$3", [newEmail, newName, customerId,])
        .then(() => res.send(`Customer ${customerId} updated`))
        .catch((error) => {
            console.error(error);
            res.status(500).json(error);
        });
});
app.delete('/customers/:id', (req,res) => {
  const customerId = req.params.id;
  pool.query("DELETE FROM customers WHERE id=$1", [customerId])
  .then((result) => res.send(result.rows))
  .catch((err) => console.log(err))
})
app.delete('/hotels/:id', (req,res) => {
  const hotelId = req.params.id;
  pool.query("DELETE FROM hotels WHERE id=$1", [hotelId])
  .then((result) => res.send(result.rows))
  .catch((err) => console.log(err))
})



app.get("/customers", (req, res) => {
  const { customerId } = req.params;
  return pool
    .query(`SELECT * FROM customers ORDER BY name`)
    .then((result) => res.send(result))
    .catch((error) => console.log(error));
});




port = process.env.PORT || 9998
app.listen(port, function() {
    console.log(`server is running in port:${port}`)
})