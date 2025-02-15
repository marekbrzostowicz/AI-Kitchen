const db = require("./database");

const checkDailyLimit = async (userId, operationType, maxLimit) => {
  const [rows] = await db.promise().execute(
    `SELECT COUNT(*) AS count
        FROM user_operations_log
        WHERE user_id = ?
        AND operation_type = ?
        AND DATE(generated_at) = CURDATE()`,
    [userId, operationType]
  );
  return rows[0].count < maxLimit;
};

const checkTotalSavedRecipes = async (userId, maxRecipes) => {
  const [rows] = await db.promise().execute(
    `SELECT COUNT(*) AS COUNT
        FROM recipes
        WHERE user_id = ?`,
    [userId]
  );
  return rows[0].count < maxRecipes;
};

const logUserOperation = async (userId, operationType) => {
  await db
    .promise()
    .execute(
      `INSERT INTO user_operations_log (user_id, operation_type) VALUES (?, ?)`,
      [userId, operationType]
    );
};

module.exports = {
  checkDailyLimit,
  checkTotalSavedRecipes,
  logUserOperation,
};
