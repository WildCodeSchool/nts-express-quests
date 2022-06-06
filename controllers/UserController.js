const connection = require("../db-config")
const Joi = require('joi')
const User = require('../models/User')

const browse = async (req, res) => {
  try {
    const users = await User.findMany({filters: req.query})
    res.status(200).json(users);
  }
  catch(err) {
    res.status(500).send(`Erreur lors de la récupération des données : ${err.message}`)
  }
}


const read = async (req, res) => {
  try {
    const [result] = await connection.promise().query("SELECT * FROM user WHERE id = ?", [req.params.id])

    if (result.length == 0){
      res.status(404).send("Utilisateur non trouvé")
    }

    res.status(200).json(result[0]);
  }
  catch(err) {
    console.log(err)
    res.status(500).send("Erreur lors de la récupération des données")
  }
}


const add = async (req, res) => {
  const { firstname, lastname, email, city, language } = req.body
  let validationErrors = null

  try {
    let [userInDatabase] = await connection.promise().query(
      'SELECT id FROM user WHERE email = ?', [email]
    )

    if (userInDatabase.length) throw new Error("DUPLICATE_EMAIL")

    const rules = {
      email: Joi.string().email().max(255).required(),
      firstname: Joi.string().max(255).required(),
      lastname: Joi.string().max(255).required(),
      city: Joi.string().max(255),
      language: Joi.string().max(255)
    }

    validationErrors = Joi.object(rules).validate({
      firstname,
      lastname,
      email,
      city,
      language
    }, {abortEarly: false}).error

    if (validationErrors) throw new Error("INVALID_DATA")

    let [result] = await connection.promise().query(
      'INSERT INTO user (firstname, lastname, email, city, language) VALUES (?,?,?,?,?)',
      [firstname, lastname, email, city, language]
    )

    const id = result.insertId
    const newUser = {id, firstname, lastname, email, city, language}

    res.status(201).json(newUser)
  }
  catch(err){
    if (err.message === "DUPLICATE_EMAIL" ) {
      res.status(409).json({message: "Cet email existe déjà"})
    }

    if (err.message === "INVALID_DATA" ) {
      res.status(422).json({validationErrors})
    }

    console.log(err)
    res.status(500).send("Erreur inconnue lors de l'ajout de l'utilisateur")
  }
}


const edit = async (req, res) => {
  const { id } = req.params
  const data = req.body;
  let validationErrors = null

  try {
    if (data.email) {
      let [userInDatabase] = await connection.promise().query(
        'SELECT id FROM user WHERE email = ?', [data.email]
      )

      if (userInDatabase.length) throw new Error("DUPLICATE_EMAIL")
    }

    const rules = {
      email: Joi.string().email().max(255),
      firstname: Joi.string().max(255),
      lastname: Joi.string().max(255),
      city: Joi.string().max(255),
      language: Joi.string().max(255)
    }

    validationErrors = Joi.object(rules).validate({
      firstname: data.firstname,
      lastname: data.lastname,
      email: data.email,
      city: data.city,
      language: data.language,
    }, {abortEarly: false}).error

    if (validationErrors) throw new Error("INVALID_DATA")

    let [result] = await connection.promise().query("UPDATE user SET ? WHERE id = ?", [data, id])

    if (result.affectedRows === 0) {
      res.status(404).send("Utilisateur inexistant")
    }

    res.sendStatus(204)
  }
  catch(err){
    if (err.message === "DUPLICATE_EMAIL" ) {
      res.status(409).json({message: "Cet email existe déjà"})
    }

    if (err.message === "INVALID_DATA" ) {
      res.status(422).json({validationErrors})
    }
    res.status(500).send("Erreur lors de la modification de l'utilisateur")
  }
}

const destroy = async (req, res) => {
  const { id } = req.params

  try {
    await connection.promise().query("DELETE FROM user WHERE id = ?", [id])
    res.sendStatus(204)
  }
  catch(err){
    res.status(500).send("Erreur lors de la suppression de l'utilisateur")
  }
}

module.exports = {
  browse,
  read,
  add,
  edit,
  delete: destroy
}