import { Participant, ParticipantKey } from "@xilution/todd-coin-types";
import { DbClient } from "./db-client";
import { v4 } from "uuid";
import { ParticipantKeyInstance } from "./types";
import { Model } from "sequelize";
import dayjs from "dayjs";

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

export const getParticipantKeyById = async (
  dbClient: DbClient,
  id: string
): Promise<ParticipantKey | undefined> => {
  const nodeModel = dbClient.sequelize?.models.ParticipantKey;

  if (nodeModel === undefined) {
    return;
  }

  const model = await nodeModel.findByPk(id);

  if (!model) {
    return;
  }

  const dbParticipantKey = model.get();

  return map(dbParticipantKey);
};

export const getEffectiveParticipantKeyByParticipant = async (
  dbClient: DbClient,
  participant: Participant
): Promise<ParticipantKey | undefined> => {
  const participantKeyModel = dbClient.sequelize?.models.ParticipantKey;

  if (participantKeyModel === undefined) {
    return;
  }

  const models: Model[] = await participantKeyModel.findAll({
    where: {
      participantId: participant.id,
    },
    order: [["createdAt", "DESC"]],
  });

  const now = dayjs();

  return models
    .map((model: Model) => map(model.get()))
    .find(
      (participantKey: ParticipantKey) =>
        dayjs(participantKey.effective.from).isBefore(now) &&
        dayjs(participantKey.effective.to).isAfter(now)
    );
};

export const getParticipantKeys = async (
  dbClient: DbClient,
  pageNumber: number,
  pageSize: number
): Promise<{ count: number; rows: ParticipantKey[] }> => {
  const nodeModel = dbClient.sequelize?.models.ParticipantKey;

  if (nodeModel === undefined) {
    return { count: 0, rows: [] };
  }

  const { count, rows } = await nodeModel.findAndCountAll({
    offset: pageNumber * pageSize,
    order: [["createdAt", "DESC"]],
    limit: pageSize,
  });

  return {
    count,
    rows: rows.map((model: Model<ParticipantKeyInstance>) => {
      const dbParticipantKey = model.get();

      return map(dbParticipantKey);
    }),
  };
};

export const createParticipantKey = async (
  dbClient: DbClient,
  participant: Participant,
  newParticipantKey: ParticipantKey
): Promise<ParticipantKey | undefined> => {
  const nodeModel = dbClient.sequelize?.models.ParticipantKey;

  if (nodeModel === undefined) {
    return;
  }

  const model = await nodeModel.create({
    id: newParticipantKey.id || v4(),
    participantId: participant.id,
    publicKey: newParticipantKey.public,
    effectiveFrom: newParticipantKey.effective.from,
    effectiveTo: newParticipantKey.effective.to,
  });

  const dbParticipantKey = model.get();

  return {
    ...map(dbParticipantKey),
    participant,
  };
};

export const deactivateParticipantKey = async (
  dbClient: DbClient,
  updatedParticipantKey: ParticipantKey
): Promise<void> => {
  const participantKeyModel = dbClient.sequelize?.models.ParticipantKey;

  if (participantKeyModel === undefined) {
    return;
  }

  // todo - check to see if the effective to is greater than today and that the effective from is in the past

  await participantKeyModel.update(
    {
      effectiveTo: dayjs().toISOString(),
    },
    {
      where: {
        id: updatedParticipantKey.id,
      },
    }
  );

  return;
};
