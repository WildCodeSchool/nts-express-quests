const connection = require("../db-config")
const Joi = require('joi')

const browse =  async (req, res) => {

  let sql = "SELECT * FROM movies";
  let sqlValues = []

  if (req.query.color) {
    let statment = sqlValues.length > 0 ? "AND" : "WHERE"

    sql = `${sql} ${statment} color = ?`
    sqlValues.push(req.query.color)
  }

  if (req.query.max_duration) {
    let statment = sqlValues.length > 0 ? "AND" : "WHERE"

    sql = `${sql} ${statment} duration <= ?`
    sqlValues.push(req.query.max_duration)
  }

  try {
    const [result] = await connection.promise().query(sql, sqlValues)
    res.status(200).json(result);
  }
  catch(err) {
    res.status(500).send(`Erreur lors de la récupération des données : ${err.message}`)
  }
}

const read = async (req, res) => {
  try {
    const [result] = await connection.promise().query("SELECT * FROM movies WHERE id = ?", [req.params.id])

    if (result.length == 0){
      res.status(404).send("Film non trouvé")
    }

    res.status(200).json(result[0]);
  }
  catch(err) {
    console.log(err)
    res.status(500).send("Erreur lors de la récupération des données")
  }
}

const add = async (req, res) => {
  const { title, director, year, color, duration } = req.body
  let validationErrors = null

  try {
    const rules = {
      title: Joi.string().max(255).required(),
      director: Joi.string().max(255).required(),
      year: Joi.number().min(1888).required(),
      color: Joi.boolean(),
      duration: Joi.number().integer().min(0)
    }

    validationErrors = Joi.object(rules).validate({
      title, director, year, color, duration
    }, {abortEarly: false}).error

    if (validationErrors) throw new Error("INVALID_DATA")

    let [result] = await connection.promise().query(
      'INSERT INTO movies (title, director, year, color, duration) VALUES (?,?,?,?,?)',
      [title, director, year, color, duration]
    )

    const id = result.insertId
    const createdMovie = {id, title, director, year, color, duration}

    res.status(201).json(createdMovie)
  }
  catch(err){
    if (err.message === "INVALID_DATA" ) {
      res.status(422).json({validationErrors})
    }

    res.status(500).send("Erreur inconnue lors de l'ajout du film")
  }
}

const edit = async (req, res) => {
  const { id } = req.params
  const data = req.body;
  let validationErrors = null

  try {
    const rules = {
      title: Joi.string().max(255),
      director: Joi.string().max(255),
      year: Joi.number().min(1888),
      color: Joi.boolean(),
      duration: Joi.number().integer().min(0)
    }

    validationErrors = Joi.object(rules).validate({
      title: data.title,
      director: data.director,
      year: data.year,
      color: data.color,
      duration: data.duration,
    }, {abortEarly: false}).error

    if (validationErrors) throw new Error("INVALID_DATA")

    let [result] = await connection.promise().query("UPDATE movies SET ? WHERE id = ?", [data, id])

    if (result.affectedRows === 0) {
      res.status(404).send("Film inexistant")
    }

    res.sendStatus(204)
  }
  catch(err){
    if (err.message === "INVALID_DATA" ) {
      res.status(422).json({validationErrors})
    }

    res.status(500).send("Erreur inconnue lors de la modification du film")
  }
}

const destroy = async (req, res) => {
  const { id } = req.params

  try {
    await connection.promise().query("DELETE FROM movies WHERE id = ?", [id])
    res.sendStatus(204)
  }
  catch(err){
    res.status(500).send("Erreur lors de la suppression du film")
  }
}

module.exports = {
  browse,
  read,
  add,
  edit,
  delete: destroy
}