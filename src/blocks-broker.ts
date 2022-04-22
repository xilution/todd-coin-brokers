import { Block, Transaction } from "@xilution/todd-coin-types";
import { DbClient } from "./db-client";
import { v4 } from "uuid";
import {
  MAX_TRANSACTIONS_PER_BLOCK,
  MINING_REWARD,
} from "@xilution/todd-coin-constants";
import { getBlockTransactions } from "./transactions-broker";
import { BlockInstance } from "./types";
import { Model } from "sequelize";
import _ from "lodash";

const map = (dbBlock: BlockInstance): Block => ({
  id: dbBlock.id,
  sequenceId: dbBlock.sequenceId,
  createdAt: dbBlock.createdAt,
  updatedAt: dbBlock.updatedAt,
  transactions: [],
  nonce: dbBlock.nonce,
  previousHash: dbBlock.previousHash,
  hash: dbBlock.hash,
});

export const getBlockById = async (
  dbClient: DbClient,
  id: string
): Promise<Block | undefined> => {
  const blockModel = dbClient.sequelize?.models.Block;

  if (blockModel === undefined) {
    return;
  }

  const model = await blockModel.findByPk(id);

  if (!model) {
    return;
  }

  const dbBlock = model.get();

  const { rows } = await getBlockTransactions(
    dbClient,
    0,
    MAX_TRANSACTIONS_PER_BLOCK,
    dbBlock.id
  );

  return { ...map(dbBlock), transactions: rows };
};

export const getLatestBlock = async (
  dbClient: DbClient
): Promise<Block | undefined> => {
  const blockModel = dbClient.sequelize?.models.Block;

  if (blockModel === undefined) {
    return;
  }

  const maxSequenceId: number = await blockModel.max("sequenceId");

  const models: Model[] = await blockModel.findAll({
    where: {
      sequenceId: maxSequenceId,
    },
  });

  if (models.length > 1) {
    throw new Error(
      `unable to get latest block because more than one block was found with the same sequenceId ${maxSequenceId}`
    );
  }

  const model = _.first(models);

  if (model === undefined) {
    return;
  }

  const dbBlock = model.get();

  const { rows } = await getBlockTransactions(
      dbClient,
      0,
      MAX_TRANSACTIONS_PER_BLOCK,
      dbBlock.id
  );

  return { ...map(dbBlock), transactions: rows };
};

export const getBlocks = async (
  dbClient: DbClient,
  pageNumber: number,
  pageSize: number
): Promise<{ count: number; rows: Block[] }> => {
  const blockModel = dbClient.sequelize?.models.Block;

  if (blockModel === undefined) {
    return { count: 0, rows: [] };
  }

  const { count, rows } = await blockModel.findAndCountAll({
    offset: pageNumber * pageSize,
    order: [["createdAt", "ASC"]],
    limit: pageSize,
  });

  return {
    count,
    rows: await Promise.all(
      rows.map(async (model) => {
        const dbBlock = model.get();

        const { rows } = await getBlockTransactions(
          dbClient,
          0,
          MAX_TRANSACTIONS_PER_BLOCK,
          dbBlock.id
        );

        return { ...map(dbBlock), transactions: rows };
      })
    ),
  };
};

export const createBlock = async (
  dbClient: DbClient,
  newBlock: Block,
  minerPublicKey: string
): Promise<Block | undefined> => {
  return await dbClient.transaction<Block | undefined>(async () => {
    const blockModel = dbClient.sequelize?.models.Block;
    const transactionModel = dbClient.sequelize?.models.Transaction;

    if (blockModel === undefined || transactionModel === undefined) {
      return;
    }

    const model = await blockModel.create({
      id: newBlock.id || v4(),
      nonce: newBlock.nonce,
      previousHash: newBlock.previousHash,
      hash: newBlock.hash,
    });

    await Promise.all(
      newBlock.transactions.map((transaction: Transaction) => {
        return transactionModel.update(
          {
            type: "block",
            blockId: newBlock.id,
          },
          {
            where: {
              id: transaction.id,
            },
          }
        );
      })
    );

    await transactionModel.create({
      id: v4(),
      type: "signed",
      to: minerPublicKey,
      amount: MINING_REWARD,
      description: "mining reward",
    });

    const dbBlock = model.get();

    const { rows } = await getBlockTransactions(
      dbClient,
      0,
      MAX_TRANSACTIONS_PER_BLOCK,
      dbBlock.id
    );

    return { ...map(dbBlock), transactions: rows };
  });
};
