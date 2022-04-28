import { DbClient } from "./db-client";
import { v4 } from "uuid";
import {
  OrganizationParticipantRef,
  OrganizationParticipantRefInstance,
} from "./types";
import { Model } from "sequelize";

const map = (
  dbOrganizationParticipantRef: OrganizationParticipantRefInstance
): OrganizationParticipantRef => ({
  id: dbOrganizationParticipantRef.id,
  createdAt: dbOrganizationParticipantRef.createdAt,
  updatedAt: dbOrganizationParticipantRef.updatedAt,
  organizationId: dbOrganizationParticipantRef.organizationId,
  participantId: dbOrganizationParticipantRef.participantId,
});

export const getOrganizationParticipantRefById = async (
  dbClient: DbClient,
  id: string
): Promise<OrganizationParticipantRef | undefined> => {
  const organizationParticipantRefModel =
    dbClient.sequelize?.models.OrganizationParticipantRef;

  if (organizationParticipantRefModel === undefined) {
    return;
  }

  const model = await organizationParticipantRefModel.findByPk(id);

  if (!model) {
    return;
  }

  const dbOrganizationParticipantRef = model.get();

  return map(dbOrganizationParticipantRef);
};

export const getOrganizationParticipantRefByParticipantId = async (
  dbClient: DbClient,
  participantId: string
): Promise<{ count: number; rows: OrganizationParticipantRef[] }> => {
  const organizationParticipantRefModel =
    dbClient.sequelize?.models.OrganizationParticipantRef;

  if (organizationParticipantRefModel === undefined) {
    return { count: 0, rows: [] };
  }

  const { count, rows } = await organizationParticipantRefModel.findAndCountAll(
    {
      where: {
        participantId,
      },
    }
  );

  return {
    count,
    rows: rows.map((model: Model<OrganizationParticipantRefInstance>) => {
      const dbOrganizationParticipantRef = model.get();

      return map(dbOrganizationParticipantRef);
    }),
  };
};

export const getOrganizationParticipantRefByOrganizationId = async (
  dbClient: DbClient,
  organizationId: string
): Promise<{ count: number; rows: OrganizationParticipantRef[] }> => {
  const organizationParticipantRefModel =
    dbClient.sequelize?.models.OrganizationParticipantRef;

  if (organizationParticipantRefModel === undefined) {
    return { count: 0, rows: [] };
  }

  const { count, rows } = await organizationParticipantRefModel.findAndCountAll(
    {
      where: {
        organizationId,
      },
    }
  );

  return {
    count,
    rows: rows.map((model: Model<OrganizationParticipantRefInstance>) => {
      const dbOrganizationParticipantRef = model.get();

      return map(dbOrganizationParticipantRef);
    }),
  };
};

export const getOrganizationParticipantRefs = async (
  dbClient: DbClient,
  pageNumber: number,
  pageSize: number
): Promise<{ count: number; rows: OrganizationParticipantRef[] }> => {
  const organizationParticipantRefModel =
    dbClient.sequelize?.models.OrganizationParticipantRef;

  if (organizationParticipantRefModel === undefined) {
    return { count: 0, rows: [] };
  }

  const { count, rows } = await organizationParticipantRefModel.findAndCountAll(
    {
      offset: pageNumber * pageSize,
      order: [["createdAt", "DESC"]],
      limit: pageSize,
    }
  );

  return {
    count,
    rows: rows.map((model: Model<OrganizationParticipantRefInstance>) => {
      const dbOrganizationParticipantRef = model.get();

      return map(dbOrganizationParticipantRef);
    }),
  };
};

export const createOrganizationParticipantRef = async (
  dbClient: DbClient,
  newOrganizationParticipantRef: OrganizationParticipantRef
): Promise<OrganizationParticipantRef | undefined> => {
  const organizationParticipantRefModel =
    dbClient.sequelize?.models.OrganizationParticipantRef;

  // todo - watch for dupes

  if (organizationParticipantRefModel === undefined) {
    return;
  }

  const model = await organizationParticipantRefModel.create({
    id: newOrganizationParticipantRef.id || v4(),
    organizationId: newOrganizationParticipantRef.organizationId,
    participantId: newOrganizationParticipantRef.participantId,
  });

  const dbOrganizationParticipantRef = model.get();

  return map(dbOrganizationParticipantRef);
};

export const deleteOrganizationParticipantRef = async (
  dbClient: DbClient,
  organizationParticipantRef: OrganizationParticipantRef
): Promise<void> => {
  const organizationParticipantRefModel =
    dbClient.sequelize?.models.OrganizationParticipantRef;

  if (organizationParticipantRefModel === undefined) {
    return;
  }

  const { id } = organizationParticipantRef;

  await organizationParticipantRefModel.destroy({
    where: {
      id,
    },
  });
};
