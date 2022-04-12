import { Transaction } from "@xilution/todd-coin-types";
import { DbClient } from "./db-client";
import { v4 } from "uuid";
import { TransactionInstance } from "./types";
import _ from "lodash";
import { WhereOptions } from "sequelize";

const map = (dbTransaction: TransactionInstance): Transaction => ({
  id: dbTransaction.id,
  createdAt: dbTransaction.createdAt,
  updatedAt: dbTransaction.updatedAt,
  to: dbTransaction.to,
  from: dbTransaction.from,
  amount: dbTransaction.amount,
  description: dbTransaction.description,
  signature: dbTransaction.signature,
});

export const getPendingTransactionById = async (
  dbClient: DbClient,
  pendingTransactionId: string
): Promise<Transaction | undefined> => {
  const transactionModel = dbClient.sequelize?.models.Transaction;

  if (transactionModel === undefined) {
    return;
  }

  const model = await transactionModel.findByPk(pendingTransactionId);

  if (!model) {
    return;
  }

  const dbTransaction = model.get();

  if (dbTransaction.type !== "pending") {
    return;
  }

  return map(dbTransaction);
};

export const getSignedTransactionById = async (
  dbClient: DbClient,
  signedTransactionId: string
): Promise<Transaction | undefined> => {
  const transactionModel = dbClient.sequelize?.models.Transaction;

  if (transactionModel === undefined) {
    return;
  }

  const model = await transactionModel.findByPk(signedTransactionId);

  if (!model) {
    return;
  }

  const dbTransaction = model.get();

  if (dbTransaction.type !== "signed") {
    return;
  }

  return map(dbTransaction);
};

export const getBlockTransactionById = async (
  dbClient: DbClient,
  blockId: string,
  blockTransactionId: string
): Promise<Transaction | undefined> => {
  const transactionModel = dbClient.sequelize?.models.Transaction;

  if (transactionModel === undefined) {
    return;
  }

  const model = await transactionModel.findByPk(blockTransactionId);

  if (!model) {
    return;
  }

  const dbTransaction = model.get();

  if (dbTransaction.type !== "block" || dbTransaction.blockId !== blockId) {
    return;
  }

  return map(dbTransaction);
};

export const getPendingTransactions = async (
  dbClient: DbClient,
  pageNumber: number,
  pageSize: number,
  from?: string,
  to?: string
): Promise<{ count: number; rows: Transaction[] }> => {
  const transactionModel = dbClient.sequelize?.models.Transaction;

  if (transactionModel === undefined) {
    return { count: 0, rows: [] };
  }

  const { count, rows } = await transactionModel.findAndCountAll({
    where: _.pickBy({ from, to, type: "pending" }, _.identity) as WhereOptions<{
      publicKey: string;
    }>,
    offset: pageNumber * pageSize,
    order: [["createdAt", "ASC"]],
    limit: pageSize,
  });

  return {
    count,
    rows: rows.map((model) => {
      const dbTransaction = model.get();

      return map(dbTransaction);
    }),
  };
};

export const getSignedTransactions = async (
  dbClient: DbClient,
  pageNumber: number,
  pageSize: number,
  from?: string,
  to?: string
): Promise<{ count: number; rows: Transaction[] }> => {
  const transactionModel = dbClient.sequelize?.models.Transaction;

  if (transactionModel === undefined) {
    return { count: 0, rows: [] };
  }

  const { count, rows } = await transactionModel.findAndCountAll({
    where: _.pickBy({ from, to, type: "signed" }, _.identity) as WhereOptions<{
      publicKey: string;
    }>,
    offset: pageNumber * pageSize,
    order: [["createdAt", "ASC"]],
    limit: pageSize,
  });

  return {
    count,
    rows: rows.map((model) => {
      const dbTransaction = model.get();

      return map(dbTransaction);
    }),
  };
};

export const getBlockTransactions = async (
  dbClient: DbClient,
  pageNumber: number,
  pageSize: number,
  blockId: string
): Promise<{ count: number; rows: Transaction[] }> => {
  const transactionModel = dbClient.sequelize?.models.Transaction;

  if (transactionModel === undefined) {
    return { count: 0, rows: [] };
  }

  const { count, rows } = await transactionModel.findAndCountAll({
    where: {
      type: "block",
      blockId,
    },
    offset: pageNumber * pageSize,
    order: [["createdAt", "ASC"]],
    limit: pageSize,
  });

  return {
    count,
    rows: rows.map((model) => {
      const dbTransaction = model.get();

      return map(dbTransaction);
    }),
  };
};

export const createPendingTransaction = async (
  dbClient: DbClient,
  newPendingTransaction: Transaction
): Promise<Transaction | undefined> => {
  const transactionModel = dbClient.sequelize?.models.Transaction;

  if (transactionModel === undefined) {
    return;
  }

  const model = await transactionModel.create({
    id: newPendingTransaction.id || v4(),
    type: "pending",
    to: newPendingTransaction.to,
    from: newPendingTransaction.from,
    amount: newPendingTransaction.amount,
    description: newPendingTransaction.description,
    signature: undefined,
  });

  const dbTransaction = model.get();

  return map(dbTransaction);
};

export const createSignedTransaction = async (
  dbClient: DbClient,
  newSignedTransaction: Transaction
): Promise<Transaction | undefined> => {
  const transactionModel = dbClient.sequelize?.models.Transaction;

  if (transactionModel === undefined) {
    return;
  }

  const { id, signature } = newSignedTransaction;

  await transactionModel.update(
    {
      type: "signed",
      signature: signature,
    },
    {
      where: {
        id,
      },
    }
  );

  const model = await transactionModel.findByPk(id);

  if (!model) {
    return;
  }

  const dbTransaction = model.get();

  return map(dbTransaction);
};
