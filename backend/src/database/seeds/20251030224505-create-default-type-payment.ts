import { QueryInterface } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.bulkInsert(
          "TypePayments",
          [
            {
              code: "DH",
              change: true,
              installments: false,
              createdAt: new Date(),
              updatedAt: new Date()
            },
            {
              code: "CC",
              change: false,
              installments: true,
              createdAt: new Date(),
              updatedAt: new Date()
            },
            {
              code: "CD",
              change: false,
              installments: false,
              createdAt: new Date(),
              updatedAt: new Date()
            },
            {
              code: "PIX",
              change: false,
              installments: false,
              createdAt: new Date(),
              updatedAt: new Date()
            },
            {
              code: "BO",
              change: false,
              installments: true,
              createdAt: new Date(),
              updatedAt: new Date()
            },
            {
              code: "CN",
              change: false,
              installments: true,
              createdAt: new Date(),
              updatedAt: new Date()
            },
            {
              code: "TR",
              change: false,
              installments: false,
              createdAt: new Date(),
              updatedAt: new Date()
            },
          ],
          { transaction: t }
        ),
       
      ]);
    });
  },

  down: async (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.bulkDelete("TypePayments", {})
    ]);
  }
};
