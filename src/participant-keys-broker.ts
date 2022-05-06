import { Participant, ParticipantKey } from "@xilution/todd-coin-types";
import { DbClient } from "./db-client";
import { v4 } from "uuid";
import { ParticipantKeyInstance } from "./types";
import { Model } from "sequelize";
import dayjs from "dayjs";
import { getParticipantById } from "./participants-broker";
import { buildWhere } from "./broker-utils";

const map = (dbParticipantKey: ParticipantKeyInstance): ParticipantKey => ({
  id: dbParticipantKey.id,
  createdAt: dbParticipantKey.createdAt,
  updatedAt: dbParticipantKey.updatedAt,
  public: dbParticipantKey.publicKey,
  effective: {
    from: dbParticipantKey.effectiveFrom,
    to: dbParticipantKey.effectiveTo,
  },
});

const appendRelations = async (
  dbClient: DbClient,
  dbParticipantKey: ParticipantKeyInstance
) => {
  const participant = await getParticipantById(
    dbClient,
    dbParticipantKey.participantId,
    true
  );

  return { ...map(dbParticipantKey), participant };
};

export const getParticipantKeyById = async (
  dbClient: DbClient,
  id: string
): Promise<ParticipantKey | undefined> => {
  const participantKeyModel = dbClient.sequelize?.models.ParticipantKey;

  if (participantKeyModel === undefined) {
    throw new Error(
      "unable to get a participant key by id because the participant key model is undefined"
    );
  }

  const model = await participantKeyModel.findByPk(id);

  if (!model) {
    return;
  }

  const dbParticipantKey = model.get();

  return appendRelations(dbClient, dbParticipantKey);
};

export const getEffectiveParticipantKeyByParticipant = async (
  dbClient: DbClient,
  participant: Participant
): Promise<ParticipantKey | undefined> => {
  const participantKeyModel = dbClient.sequelize?.models.ParticipantKey;

  if (participantKeyModel === undefined) {
    throw new Error(
      "unable to get the effective participant key by participant because the participant key model is undefined"
    );
  }

  const models: Model[] = await participantKeyModel.findAll({
    where: {
      participantId: participant.id,
    },
    order: [["createdAt", "DESC"]],
  });

  const now = dayjs();

  const dbParticipantKey: ParticipantKeyInstance | undefined = models
    .map((model: Model) => model.get())
    .find(
      (participantKeyInstance: ParticipantKeyInstance) =>
        dayjs(participantKeyInstance.effectiveFrom).isBefore(now) &&
        dayjs(participantKeyInstance.effectiveTo).isAfter(now)
    );

  if (dbParticipantKey === undefined) {
    return;
  }

  return appendRelations(dbClient, dbParticipantKey);
};

export const getParticipantKeys = async (
  dbClient: DbClient,
  pageNumber: number,
  pageSize: number,
  participantId: string,
  searchCriteria?: {
    ids?: string[];
    public?: string;
  }
): Promise<{ count: number; rows: ParticipantKey[] }> => {
  const nodeModel = dbClient.sequelize?.models.ParticipantKey;

  if (nodeModel === undefined) {
    return { count: 0, rows: [] };
  }

  const { count, rows } = await nodeModel.findAndCountAll({
    where: {
      ...buildWhere(searchCriteria),
      participantId,
    },
    offset: pageNumber * pageSize,
    order: [["createdAt", "DESC"]],
    limit: pageSize,
  });

  return {
    count,
    rows: await Promise.all(
      rows.map((model: Model<ParticipantKeyInstance>) => {
        const dbParticipantKey = model.get();

        return appendRelations(dbClient, dbParticipantKey);
      })
    ),
  };
};

export const createParticipantKey = async (
  dbClient: DbClient,
  participant: Participant,
  newParticipantKey: ParticipantKey
): Promise<ParticipantKey | undefined> => {
  const nodeModel = dbClient.sequelize?.models.ParticipantKey;

  if (nodeModel === undefined) {
    throw new Error(
      "unable to create a participant key because the participant key model is undefined"
    );
  }

  const model = await nodeModel.create({
    id: newParticipantKey.id || v4(),
    participantId: participant.id,
    publicKey: newParticipantKey.public,
    effectiveFrom: newParticipantKey.effective.from,
    effectiveTo: newParticipantKey.effective.to,
  });

  const dbParticipantKey = model.get();

  return appendRelations(dbClient, dbParticipantKey);
};

export const updateParticipantKey = async (
  dbClient: DbClient,
  updatedParticipantKey: ParticipantKey
): Promise<void> => {
  const participantKeyModel = dbClient.sequelize?.models.ParticipantKey;

  if (participantKeyModel === undefined) {
    throw new Error(
      "unable to update a participant key because the participant key model is undefined"
    );
  }

  const { id, effective } = updatedParticipantKey;
  const { from, to } = effective;

  await participantKeyModel.update(
    {
      effectiveFrom: from,
      effectiveTo: to,
      publicKey: updatedParticipantKey.public,
    },
    {
      where: {
        id,
      },
    }
  );

  return;
};
