const connection = require('../db-config');

const findMany = async ({ filters: { language } }) => {
  let sql = "SELECT * FROM user";
  let sqlValues = []

  if (language) {
    sql = `${sql} WHERE language = ?`
    sqlValues.push(language)
  }

  const [result] = await connection.promise().query(sql, sqlValues)

  return result;
};

module.exports = {
  findMany
}


