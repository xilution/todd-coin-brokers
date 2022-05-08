import {
  Block,
  BlockTransaction,
  Organization,
  Participant,
  ParticipantKey,
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
import { getBlockById } from "./blocks-broker";
import { getParticipantKeyById } from "./participant-keys-broker";
import { getOrganizationById } from "./organizations-broker";

const transactionTypeMap: { [type: string]: TransactionType } = {
  time: TransactionType.TIME,
  treasure: TransactionType.TREASURE,
};

const mapPendingTransaction = (
  dbTransaction: TransactionInstance,
  fromParticipant: Participant,
  fromOrganization: Organization,
  toParticipant: Participant,
  toOrganization: Organization
): PendingTransaction<TransactionDetails> => ({
  id: dbTransaction.id,
  createdAt: dbTransaction.createdAt,
  updatedAt: dbTransaction.updatedAt,
  fromParticipant,
  fromOrganization,
  toParticipant,
  toOrganization,
  description: dbTransaction.description,
  type: transactionTypeMap[dbTransaction.type],
  details: dbTransaction.details,
});

const mapSignedTransaction = (
  dbTransaction: TransactionInstance,
  fromParticipant: Participant,
  fromOrganization: Organization,
  toParticipant: Participant,
  toOrganization: Organization,
  participantKey: ParticipantKey
): SignedTransaction<TransactionDetails> => ({
  id: dbTransaction.id,
  createdAt: dbTransaction.createdAt,
  updatedAt: dbTransaction.updatedAt,
  fromParticipant,
  fromOrganization,
  toParticipant,
  toOrganization,
  description: dbTransaction.description,
  goodPoints: dbTransaction.goodPoints,
  signature: dbTransaction.signature,
  participantKey,
  type: transactionTypeMap[dbTransaction.type],
  details: dbTransaction.details,
});

const mapBlockTransaction = (
  dbTransaction: TransactionInstance,
  fromParticipant: Participant,
  fromOrganization: Organization,
  toParticipant: Participant,
  toOrganization: Organization,
  block: Block,
  participantKey: ParticipantKey
): BlockTransaction<TransactionDetails> => ({
  id: dbTransaction.id,
  createdAt: dbTransaction.createdAt,
  updatedAt: dbTransaction.updatedAt,
  fromParticipant,
  fromOrganization,
  toParticipant,
  toOrganization,
  goodPoints: dbTransaction.goodPoints,
  description: dbTransaction.description,
  signature: dbTransaction.signature,
  participantKey,
  type: transactionTypeMap[dbTransaction.type],
  details: dbTransaction.details,
  block,
});

const getFromParticipant = async (
  dbTransaction: TransactionInstance,
  dbClient: DbClient
): Promise<Participant> => {
  return (await getParticipantById(
    dbClient,
    dbTransaction.fromParticipantId
  )) as Participant;
};

const getFromOrganization = async (
  dbTransaction: TransactionInstance,
  dbClient: DbClient
): Promise<Organization> => {
  return (await getOrganizationById(
    dbClient,
    dbTransaction.fromOrganizationId
  )) as Organization;
};

const getToParticipant = async (
  dbTransaction: TransactionInstance,
  dbClient: DbClient
): Promise<Participant> => {
  return (await getParticipantById(
    dbClient,
    dbTransaction.toParticipantId
  )) as Participant;
};

const getToOrganization = async (
  dbTransaction: TransactionInstance,
  dbClient: DbClient
): Promise<Organization> => {
  return (await getOrganizationById(
    dbClient,
    dbTransaction.toOrganizationId
  )) as Organization;
};

const getParticipantKey = async (
  dbClient: DbClient,
  dbTransaction: TransactionInstance
) => {
  return (await getParticipantKeyById(
    dbClient,
    dbTransaction.participantKeyId
  )) as ParticipantKey;
};

const getBlock = async (
  dbClient: DbClient,
  dbTransaction: TransactionInstance
) => {
  return (await getBlockById(dbClient, dbTransaction.blockId, true)) as Block;
};

export const getPendingTransactionById = async (
  dbClient: DbClient,
  pendingTransactionId: string
): Promise<PendingTransaction<TransactionDetails> | undefined> => {
  const transactionModel = dbClient.sequelize?.models.Transaction;

  if (transactionModel === undefined) {
    throw new Error(
      "unable to get a pending transaction by id because the transaction model is undefined"
    );
  }

  const model = await transactionModel.findByPk(pendingTransactionId);

  if (!model) {
    return;
  }

  const dbTransaction = model.get();

  if (dbTransaction.state !== "pending") {
    return;
  }

  const fromParticipant: Participant = await getFromParticipant(
    dbTransaction,
    dbClient
  );
  const fromOrganization: Organization = await getFromOrganization(
    dbTransaction,
    dbClient
  );
  const toParticipant: Participant = await getToParticipant(
    dbTransaction,
    dbClient
  );
  const toOrganization: Organization = await getToOrganization(
    dbTransaction,
    dbClient
  );

  return mapPendingTransaction(
    dbTransaction,
    fromParticipant,
    fromOrganization,
    toParticipant,
    toOrganization
  );
};

export const getSignedTransactionById = async (
  dbClient: DbClient,
  signedTransactionId: string
): Promise<SignedTransaction<TransactionDetails> | undefined> => {
  const transactionModel = dbClient.sequelize?.models.Transaction;

  if (transactionModel === undefined) {
    throw new Error(
      "unable to get a signed transaction by id because the transaction model is undefined"
    );
  }

  const model = await transactionModel.findByPk(signedTransactionId);

  if (!model) {
    return;
  }

  const dbTransaction = model.get();

  if (dbTransaction.state !== "signed") {
    return;
  }

  const fromParticipant: Participant = await getFromParticipant(
    dbTransaction,
    dbClient
  );
  const fromOrganization: Organization = await getFromOrganization(
    dbTransaction,
    dbClient
  );
  const toParticipant: Participant = await getToParticipant(
    dbTransaction,
    dbClient
  );
  const toOrganization: Organization = await getToOrganization(
    dbTransaction,
    dbClient
  );
  const participantKey: ParticipantKey = await getParticipantKey(
    dbClient,
    dbTransaction
  );

  return mapSignedTransaction(
    dbTransaction,
    fromParticipant,
    fromOrganization,
    toParticipant,
    toOrganization,
    participantKey
  );
};

export const getBlockTransactionById = async (
  dbClient: DbClient,
  blockId: string,
  blockTransactionId: string
): Promise<BlockTransaction<TransactionDetails> | undefined> => {
  const transactionModel = dbClient.sequelize?.models.Transaction;

  if (transactionModel === undefined) {
    throw new Error(
      "unable to get a block transaction by id because the transaction model is undefined"
    );
  }

  const model = await transactionModel.findByPk(blockTransactionId);

  if (!model) {
    return;
  }

  const dbTransaction = model.get();

  if (dbTransaction.state !== "block" || dbTransaction.blockId !== blockId) {
    return;
  }

  const fromParticipant: Participant = await getFromParticipant(
    dbTransaction,
    dbClient
  );
  const fromOrganization: Organization = await getFromOrganization(
    dbTransaction,
    dbClient
  );
  const toParticipant: Participant = await getToParticipant(
    dbTransaction,
    dbClient
  );
  const toOrganization: Organization = await getToOrganization(
    dbTransaction,
    dbClient
  );
  const block: Block = await getBlock(dbClient, dbTransaction);
  const participantKey: ParticipantKey = await getParticipantKey(
    dbClient,
    dbTransaction
  );

  return mapBlockTransaction(
    dbTransaction,
    fromParticipant,
    fromOrganization,
    toParticipant,
    toOrganization,
    block,
    participantKey
  );
};

export const getPendingTransactions = async (
  dbClient: DbClient,
  pageNumber: number,
  pageSize: number,
  searchCriteria?: {
    ids?: string[];
    fromId?: string;
    toId?: string;
    type?: string;
  }
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
      ...buildWhere(searchCriteria),
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

        const fromParticipant: Participant = await getFromParticipant(
          dbTransaction,
          dbClient
        );
        const fromOrganization: Organization = await getFromOrganization(
          dbTransaction,
          dbClient
        );
        const toParticipant: Participant = await getToParticipant(
          dbTransaction,
          dbClient
        );
        const toOrganization: Organization = await getToOrganization(
          dbTransaction,
          dbClient
        );

        return mapPendingTransaction(
          dbTransaction,
          fromParticipant,
          fromOrganization,
          toParticipant,
          toOrganization
        );
      })
    ),
  };
};

export const getSignedTransactions = async (
  dbClient: DbClient,
  pageNumber: number,
  pageSize: number,
  searchCriteria?: {
    ids?: string[];
    fromId?: string;
    toId?: string;
    type?: string;
  }
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
      ...buildWhere(searchCriteria),
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

        const fromParticipant: Participant = await getFromParticipant(
          dbTransaction,
          dbClient
        );
        const fromOrganization: Organization = await getFromOrganization(
          dbTransaction,
          dbClient
        );
        const toParticipant: Participant = await getToParticipant(
          dbTransaction,
          dbClient
        );
        const toOrganization: Organization = await getToOrganization(
          dbTransaction,
          dbClient
        );
        const participantKey: ParticipantKey = await getParticipantKey(
          dbClient,
          dbTransaction
        );

        return mapSignedTransaction(
          dbTransaction,
          fromParticipant,
          fromOrganization,
          toParticipant,
          toOrganization,
          participantKey
        );
      })
    ),
  };
};

export const getBlockTransactions = async (
  dbClient: DbClient,
  pageNumber: number,
  pageSize: number,
  blockId: string,
  searchCriteria?: {
    ids?: string[];
    fromId?: string;
    toId?: string;
    type?: string;
  }
): Promise<{ count: number; rows: BlockTransaction<TransactionDetails>[] }> => {
  const transactionModel = dbClient.sequelize?.models.Transaction;

  if (transactionModel === undefined) {
    return { count: 0, rows: [] };
  }

  const { count, rows } = await transactionModel.findAndCountAll({
    where: {
      ...buildWhere(searchCriteria),
      blockId,
      state: "block",
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

        const fromParticipant: Participant = await getFromParticipant(
          dbTransaction,
          dbClient
        );
        const fromOrganization: Organization = await getFromOrganization(
          dbTransaction,
          dbClient
        );
        const toParticipant: Participant = await getToParticipant(
          dbTransaction,
          dbClient
        );
        const toOrganization: Organization = await getToOrganization(
          dbTransaction,
          dbClient
        );
        const block: Block = await getBlock(dbClient, dbTransaction);
        const participantKey: ParticipantKey = await getParticipantKey(
          dbClient,
          dbTransaction
        );

        return mapBlockTransaction(
          dbTransaction,
          fromParticipant,
          fromOrganization,
          toParticipant,
          toOrganization,
          block,
          participantKey
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
    throw new Error(
      "unable to create a pending transaction because the transaction model is undefined"
    );
  }

  const model = await transactionModel.create({
    id: newPendingTransaction.id || v4(),
    state: "pending",
    type: _.toLower(newPendingTransaction.type),
    toParticipantId: newPendingTransaction.toParticipant?.id,
    toOrganizationId: newPendingTransaction.toOrganization?.id,
    fromParticipantId: newPendingTransaction.fromParticipant?.id,
    fromOrganizationId: newPendingTransaction.fromOrganization?.id,
    details: newPendingTransaction.details,
    description: newPendingTransaction.description,
  });

  const dbTransaction = model.get();

  const fromParticipant: Participant = await getFromParticipant(
    dbTransaction,
    dbClient
  );
  const fromOrganization: Organization = await getFromOrganization(
    dbTransaction,
    dbClient
  );
  const toParticipant: Participant = await getToParticipant(
    dbTransaction,
    dbClient
  );
  const toOrganization: Organization = await getToOrganization(
    dbTransaction,
    dbClient
  );

  return mapPendingTransaction(
    dbTransaction,
    fromParticipant,
    fromOrganization,
    toParticipant,
    toOrganization
  );
};

export const updatePendingTransaction = async (
  dbClient: DbClient,
  updatedPendingTransaction: PendingTransaction<TransactionDetails>
): Promise<void> => {
  const transactionModel = dbClient.sequelize?.models.Transaction;

  if (transactionModel === undefined) {
    throw new Error(
      "unable to update a pending transaction because the transaction model is undefined"
    );
  }

  const { id, details } = updatedPendingTransaction;

  await transactionModel.update(
    {
      details,
    },
    {
      where: {
        id,
        state: "pending",
      },
    }
  );
};

export const createSignedTransaction = async (
  dbClient: DbClient,
  newSignedTransaction: SignedTransaction<TransactionDetails>
): Promise<SignedTransaction<TransactionDetails> | undefined> => {
  const transactionModel = dbClient.sequelize?.models.Transaction;

  if (transactionModel === undefined) {
    throw new Error(
      "unable to create a pending transaction because the transaction model is undefined"
    );
  }

  const { id, signature, goodPoints } = newSignedTransaction;

  await transactionModel.update(
    {
      state: "signed",
      signature,
      participantKeyId: newSignedTransaction.participantKey.id,
      goodPoints,
    },
    {
      where: {
        id,
        state: "pending",
      },
    }
  );

  const model = await transactionModel.findByPk(id);

  if (!model) {
    return;
  }

  const dbTransaction: TransactionInstance = model.get();

  const fromParticipant: Participant = await getFromParticipant(
    dbTransaction,
    dbClient
  );
  const fromOrganization: Organization = await getFromOrganization(
    dbTransaction,
    dbClient
  );
  const toParticipant: Participant = await getToParticipant(
    dbTransaction,
    dbClient
  );
  const toOrganization: Organization = await getToOrganization(
    dbTransaction,
    dbClient
  );
  const participantKey: ParticipantKey = await getParticipantKey(
    dbClient,
    dbTransaction
  );

  return mapSignedTransaction(
    dbTransaction,
    fromParticipant,
    fromOrganization,
    toParticipant,
    toOrganization,
    participantKey
  );
};

export const updateSignedTransaction = async (
  dbClient: DbClient,
  updatedSignedTransaction: SignedTransaction<TransactionDetails>
): Promise<void> => {
  const transactionModel = dbClient.sequelize?.models.Transaction;

  if (transactionModel === undefined) {
    throw new Error(
      "unable to update a pending transaction because the transaction model is undefined"
    );
  }

  const { id, signature, goodPoints } = updatedSignedTransaction;

  await transactionModel.update(
    {
      signature,
      goodPoints,
    },
    {
      where: {
        id,
        state: "signed",
      },
    }
  );
};

export const deletePendingTransactionById = async (
  dbClient: DbClient,
  pendingTransactionId: string
): Promise<void> => {
  const transactionModel = dbClient.sequelize?.models.Transaction;

  if (transactionModel === undefined) {
    throw new Error(
      "unable to delete a pending transaction because the transaction model is undefined"
    );
  }

  await transactionModel.destroy({
    where: {
      id: pendingTransactionId,
      state: "pending",
    },
  });
};
