import { Participant, Roles } from "@xilution/todd-coin-types";
import { DbClient } from "./db-client";
import { Model, WhereOptions } from "sequelize";
import { v4 } from "uuid";
import _ from "lodash";
import { ParticipantInstance } from "./types";

const map = (dbParticipant: ParticipantInstance): Participant => ({
  id: dbParticipant.id,
  createdAt: dbParticipant.createdAt,
  updatedAt: dbParticipant.createdAt,
  firstName: dbParticipant.firstName,
  lastName: dbParticipant.lastName,
  email: dbParticipant.email,
  phone: dbParticipant.phone,
  key: { public: dbParticipant.publicKey },
  roles: dbParticipant.roles as Roles[],
});

export const getParticipantById = async (
  dbClient: DbClient,
  id: string
): Promise<Participant | undefined> => {
  const participantModel = dbClient.sequelize?.models.Participant;

  if (participantModel === undefined) {
    return;
  }

  const model = await participantModel.findByPk(id);

  if (!model) {
    return;
  }

  const dbParticipant = model.get();

  return map(dbParticipant);
};

export const getParticipantByPublicKey = async (
  dbClient: DbClient,
  publicKey: string
): Promise<Participant | undefined> => {
  const participantModel = dbClient.sequelize?.models.Participant;

  if (participantModel === undefined) {
    return;
  }

  const models: Model[] = await participantModel.findAll({
    where: {
      publicKey,
    },
  });

  if (models.length > 1) {
    throw new Error(
      `unable to get a participant by public key because more than one participant was found for the public key ${publicKey}`
    );
  }

  const model = _.first(models);

  if (model === undefined) {
    return;
  }

  const dbParticipant = model.get();

  return map(dbParticipant);
};

export const getParticipants = async (
  dbClient: DbClient,
  pageNumber: number,
  pageSize: number,
  publicKey?: string
): Promise<{ count: number; rows: Participant[] }> => {
  const participantModel = dbClient.sequelize?.models.Participant;

  if (participantModel === undefined) {
    return { count: 0, rows: [] };
  }

  const { count, rows } = await participantModel.findAndCountAll({
    where: _.pickBy({ publicKey }, _.identity) as WhereOptions<{
      publicKey: string;
    }>,
    offset: pageNumber * pageSize,
    order: [["createdAt", "ASC"]],
    limit: pageSize,
  });

  return {
    count,
    rows: rows.map((model: Model) => {
      const dbParticipant = model.get();

      return map(dbParticipant);
    }),
  };
};

export const createParticipant = async (
  dbClient: DbClient,
  newParticipant: Participant
): Promise<Participant | undefined> => {
  const participantModel = dbClient.sequelize?.models.Participant;

  if (participantModel === undefined) {
    return;
  }

  const model = await participantModel.create({
    id: newParticipant.id || v4(),
    firstName: newParticipant.firstName,
    lastName: newParticipant.lastName,
    email: newParticipant.email,
    phone: newParticipant.phone,
    publicKey: newParticipant.key.public,
    roles: newParticipant.roles,
  });

  const dbParticipant = model.get();

  return map(dbParticipant);
};
