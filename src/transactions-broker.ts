import {
  BlockTransaction,
  Participant,
  PendingTransaction,
  SignedTransaction,
  TransactionDetails,
  TransactionType,
} from "@xilution/todd-coin-types";
import { DbClient } from "./db-client";
import { v4 } from "uuid";
import { TransactionInstance } from "./types";
import _ from "lodash";
import { getParticipantById } from "./participants-broker";
import { buildWhere } from "./broker-utils";

const transactionTypeMap: { [type: string]: TransactionType } = {
  time: TransactionType.TIME,
  treasure: TransactionType.TREASURE,
};

const mapPendingTransaction = (
  dbTransaction: TransactionInstance,
  from: Participant | undefined,
  to: Participant
): PendingTransaction<TransactionDetails> => ({
  id: dbTransaction.id,
  createdAt: dbTransaction.createdAt,
  updatedAt: dbTransaction.updatedAt,
  from,
  to,
  description: dbTransaction.description,
  type: transactionTypeMap[dbTransaction.type],
  details: JSON.parse(dbTransaction.details),
});

const mapSignedTransaction = (
  dbTransaction: TransactionInstance,
  from: Participant | undefined,
  to: Participant
): SignedTransaction<TransactionDetails> => ({
  id: dbTransaction.id,
  createdAt: dbTransaction.createdAt,
  updatedAt: dbTransaction.updatedAt,
  from,
  to,
  description: dbTransaction.description,
  goodPoints: dbTransaction.goodPoints,
  signature: dbTransaction.signature,
  type: transactionTypeMap[dbTransaction.type],
  details: JSON.parse(dbTransaction.details),
});

const mapBlockTransaction = (
  dbTransaction: TransactionInstance,
  from: Participant | undefined,
  to: Participant
): BlockTransaction<TransactionDetails> => ({
  id: dbTransaction.id,
  createdAt: dbTransaction.createdAt,
  updatedAt: dbTransaction.updatedAt,
  from,
  to,
  goodPoints: dbTransaction.goodPoints,
  description: dbTransaction.description,
  signature: dbTransaction.signature,
  type: transactionTypeMap[dbTransaction.type],
  details: JSON.parse(dbTransaction.details),
});

export const getPendingTransactionById = async (
  dbClient: DbClient,
  pendingTransactionId: string
): Promise<PendingTransaction<TransactionDetails> | undefined> => {
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

  const fromParticipant = (await getParticipantById(
    dbClient,
    dbTransaction.from
  )) as Participant | undefined;
  const toParticipant = (await getParticipantById(
    dbClient,
    dbTransaction.to
  )) as Participant;

  return mapPendingTransaction(dbTransaction, fromParticipant, toParticipant);
};

export const getSignedTransactionById = async (
  dbClient: DbClient,
  signedTransactionId: string
): Promise<SignedTransaction<TransactionDetails> | undefined> => {
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

  const fromParticipant = (await getParticipantById(
    dbClient,
    dbTransaction.from
  )) as Participant | undefined;
  const toParticipant = (await getParticipantById(
    dbClient,
    dbTransaction.to
  )) as Participant;

  return mapSignedTransaction(dbTransaction, fromParticipant, toParticipant);
};

export const getBlockTransactionById = async (
  dbClient: DbClient,
  blockId: string,
  blockTransactionId: string
): Promise<BlockTransaction<TransactionDetails> | undefined> => {
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

  const fromParticipant = (await getParticipantById(
    dbClient,
    dbTransaction.from
  )) as Participant | undefined;
  const toParticipant = (await getParticipantById(
    dbClient,
    dbTransaction.to
  )) as Participant;

  return mapBlockTransaction(dbTransaction, fromParticipant, toParticipant);
};

export const getPendingTransactions = async (
  dbClient: DbClient,
  pageNumber: number,
  pageSize: number,
  from?: string,
  to?: string
): Promise<{
  count: number;
  rows: PendingTransaction<TransactionDetails>[];
}> => {
  const transactionModel = dbClient.sequelize?.models.Transaction;

  if (transactionModel === undefined) {
    return { count: 0, rows: [] };
  }

  const { count, rows } = await transactionModel.findAndCountAll({
    where: {
      ...buildWhere({ from, to }),
      state: "pending",
    },
    offset: pageNumber * pageSize,
    order: [["createdAt", "DESC"]],
    limit: pageSize,
  });

  return {
    count,
    rows: await Promise.all(
      rows.map(async (model) => {
        const dbTransaction = model.get();

        const fromParticipant = (await getParticipantById(
          dbClient,
          dbTransaction.from
        )) as Participant | undefined;
        const toParticipant = (await getParticipantById(
          dbClient,
          dbTransaction.to
        )) as Participant;

        return mapPendingTransaction(
          dbTransaction,
          fromParticipant,
          toParticipant
        );
      })
    ),
  };
};

export const getSignedTransactions = async (
  dbClient: DbClient,
  pageNumber: number,
  pageSize: number,
  from?: string,
  to?: string
): Promise<{
  count: number;
  rows: SignedTransaction<TransactionDetails>[];
}> => {
  const transactionModel = dbClient.sequelize?.models.Transaction;

  if (transactionModel === undefined) {
    return { count: 0, rows: [] };
  }

  const { count, rows } = await transactionModel.findAndCountAll({
    where: {
      ...buildWhere({ from, to }),
      state: "signed",
    },
    offset: pageNumber * pageSize,
    order: [["createdAt", "DESC"]],
    limit: pageSize,
  });

  return {
    count,
    rows: await Promise.all(
      rows.map(async (model) => {
        const dbTransaction = model.get();

        const fromParticipant = (await getParticipantById(
          dbClient,
          dbTransaction.from
        )) as Participant | undefined;
        const toParticipant = (await getParticipantById(
          dbClient,
          dbTransaction.to
        )) as Participant;

        return mapSignedTransaction(
          dbTransaction,
          fromParticipant,
          toParticipant
        );
      })
    ),
  };
};

export const getBlockTransactions = async (
  dbClient: DbClient,
  pageNumber: number,
  pageSize: number,
  blockId: string
): Promise<{ count: number; rows: BlockTransaction<TransactionDetails>[] }> => {
  const transactionModel = dbClient.sequelize?.models.Transaction;

  if (transactionModel === undefined) {
    return { count: 0, rows: [] };
  }

  const { count, rows } = await transactionModel.findAndCountAll({
    where: {
      state: "block",
      blockId,
    },
    offset: pageNumber * pageSize,
    order: [["createdAt", "DESC"]],
    limit: pageSize,
  });

  return {
    count,
    rows: await Promise.all(
      rows.map(async (model) => {
        const dbTransaction = model.get();

        const fromParticipant = (await getParticipantById(
          dbClient,
          dbTransaction.from
        )) as Participant | undefined;
        const toParticipant = (await getParticipantById(
          dbClient,
          dbTransaction.to
        )) as Participant;

        return mapBlockTransaction(
          dbTransaction,
          fromParticipant,
          toParticipant
        );
      })
    ),
  };
};

export const createPendingTransaction = async (
  dbClient: DbClient,
  newPendingTransaction: PendingTransaction<TransactionDetails>
): Promise<PendingTransaction<TransactionDetails> | undefined> => {
  const transactionModel = dbClient.sequelize?.models.Transaction;

  if (transactionModel === undefined) {
    return;
  }

  const model = await transactionModel.create({
    id: newPendingTransaction.id || v4(),
    state: "pending",
    type: _.toLower(newPendingTransaction.type),
    toParticipantId: newPendingTransaction.to.id,
    fromParticipantId: newPendingTransaction.from?.id,
    details: JSON.stringify(newPendingTransaction.details),
    description: newPendingTransaction.description,
  });

  const dbTransaction = model.get();

  const fromParticipant = (await getParticipantById(
    dbClient,
    dbTransaction.from
  )) as Participant | undefined;
  const toParticipant = (await getParticipantById(
    dbClient,
    dbTransaction.to
  )) as Participant;

  return mapPendingTransaction(dbTransaction, fromParticipant, toParticipant);
};

export const createSignedTransaction = async (
  dbClient: DbClient,
  newSignedTransaction: SignedTransaction<TransactionDetails>
): Promise<SignedTransaction<TransactionDetails> | undefined> => {
  const transactionModel = dbClient.sequelize?.models.Transaction;

  if (transactionModel === undefined) {
    return;
  }

  const { id, signature, goodPoints } = newSignedTransaction;

  await transactionModel.update(
    {
      state: "signed",
      signature,
      goodPoints,
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

  const fromParticipant = (await getParticipantById(
    dbClient,
    dbTransaction.from
  )) as Participant | undefined;
  const toParticipant = (await getParticipantById(
    dbClient,
    dbTransaction.to
  )) as Participant;

  return mapSignedTransaction(dbTransaction, fromParticipant, toParticipant);
};
