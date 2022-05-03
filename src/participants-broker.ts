import {
  Participant,
  ParticipantKey,
  ParticipantRole,
} from "@xilution/todd-coin-types";
import { DbClient } from "./db-client";
import { Model } from "sequelize";
import { v4 } from "uuid";
import { OrganizationParticipantRef, ParticipantInstance } from "./types";
import {
  createParticipantKey,
  getParticipantKeys,
} from "./participant-keys-broker";
import { keyUtils } from "@xilution/todd-coin-utils";
import { buildWhere } from "./broker-utils";
import { DEFAULT_PAGE_SIZE } from "@xilution/todd-coin-constants";
import { getOrganizations } from "./organizations-broker";
import { getOrganizationParticipantRefByParticipantId } from "./organization-participant-refs-broker";

const map = (
  dbParticipant: ParticipantInstance
): Omit<Participant, "keys"> => ({
  id: dbParticipant.id,
  createdAt: dbParticipant.createdAt,
  updatedAt: dbParticipant.createdAt,
  email: dbParticipant.email,
  password: dbParticipant.password,
  firstName: dbParticipant.firstName,
  lastName: dbParticipant.lastName,
  phone: dbParticipant.phone,
  roles: dbParticipant.roles as ParticipantRole[],
});

const appendRelations = async (
  dbClient: DbClient,
  dbParticipant: ParticipantInstance
): Promise<Participant> => {
  const getParticipantKeysResponse = await getParticipantKeys(
    dbClient,
    0,
    DEFAULT_PAGE_SIZE,
    dbParticipant.id
  );

  const getOrganizationParticipantRefResponse =
    await getOrganizationParticipantRefByParticipantId(
      dbClient,
      dbParticipant.id
    );

  const organizationsResponse = await getOrganizations(
    dbClient,
    0,
    DEFAULT_PAGE_SIZE,
    getOrganizationParticipantRefResponse.rows.reduce(
      (ids: string[], row: OrganizationParticipantRef) =>
        row.id ? ids.concat(row.id) : ids,
      []
    )
  );

  return {
    ...map(dbParticipant),
    keys: getParticipantKeysResponse.rows,
    organizations: organizationsResponse.rows,
  };
};

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

  return await appendRelations(dbClient, dbParticipant);
};

export const getParticipantByEmail = async (
  dbClient: DbClient,
  email: string
): Promise<Participant | undefined> => {
  const participantModel = dbClient.sequelize?.models.Participant;

  if (participantModel === undefined) {
    return;
  }

  const { count, rows } = await participantModel.findAndCountAll({
    where: {
      email,
    },
  });

  if (count > 1) {
    throw Error(
      `unable to get participant by email because more then one participant is associated with the email: ${email}`
    );
  }

  if (count === 0) {
    return;
  }

  const dbParticipant = rows[0].get();

  return await appendRelations(dbClient, dbParticipant);
};

export const getParticipants = async (
  dbClient: DbClient,
  pageNumber: number,
  pageSize: number,
  ids?: string[]
): Promise<{ count: number; rows: Participant[] }> => {
  const participantModel = dbClient.sequelize?.models.Participant;

  if (participantModel === undefined) {
    return { count: 0, rows: [] };
  }

  const { count, rows } = await participantModel.findAndCountAll({
    where: buildWhere({ ids }),
    offset: pageNumber * pageSize,
    order: [["createdAt", "DESC"]],
    limit: pageSize,
  });

  return {
    count,
    rows: await Promise.all(
      rows.map(async (model: Model) => {
        const dbParticipant = model.get();

        return await appendRelations(dbClient, dbParticipant);
      })
    ),
  };
};

export const createParticipant = async (
  dbClient: DbClient,
  newParticipant: Participant
): Promise<Participant | undefined> => {
  const participantModel = dbClient.sequelize?.models.Participant;
  const participantKeyModel = dbClient.sequelize?.models.ParticipantKey;

  if (participantModel === undefined || participantKeyModel === undefined) {
    return;
  }

  const model = await participantModel.create({
    id: newParticipant.id || v4(),
    email: newParticipant.email,
    password: newParticipant.password,
    firstName: newParticipant.firstName,
    lastName: newParticipant.lastName,
    phone: newParticipant.phone,
    roles: newParticipant.roles,
  });

  const dbParticipant = model.get();

  const createdParticipant: Participant = map(dbParticipant);

  const newParticipantKey: ParticipantKey = keyUtils.generateParticipantKey();

  await createParticipantKey(dbClient, createdParticipant, newParticipantKey);

  return await appendRelations(dbClient, dbParticipant);
};

export const updateParticipant = async (
  dbClient: DbClient,
  updatedParticipant: Participant
): Promise<void> => {
  const participantModel = dbClient.sequelize?.models.Participant;

  if (participantModel === undefined) {
    return;
  }

  const { id, email, password, firstName, lastName, phone, roles } =
    updatedParticipant;

  await participantModel.update(
    {
      email,
      password,
      firstName,
      lastName,
      phone,
      roles,
    },
    {
      where: {
        id,
      },
    }
  );

  return;
};
