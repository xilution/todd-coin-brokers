import { DbClient } from "./db-client";
import { v4 } from "uuid";
import {
  OrganizationParticipantRef,
  OrganizationParticipantRefInstance,
} from "./types";
import { Model } from "sequelize";
import { buildWhere } from "./broker-utils";

const map = (
  dbOrganizationParticipantRef: OrganizationParticipantRefInstance
): OrganizationParticipantRef => ({
  id: dbOrganizationParticipantRef.id,
  createdAt: dbOrganizationParticipantRef.createdAt,
  updatedAt: dbOrganizationParticipantRef.updatedAt,
  organizationId: dbOrganizationParticipantRef.organizationId,
  participantId: dbOrganizationParticipantRef.participantId,
  isAuthorizedSigner: dbOrganizationParticipantRef.isAuthorizedSigner,
  isAdministrator: dbOrganizationParticipantRef.isAdministrator,
});

export const getOrganizationParticipantRefById = async (
  dbClient: DbClient,
  id: string
): Promise<OrganizationParticipantRef | undefined> => {
  const organizationParticipantRefModel =
    dbClient.sequelize?.models.OrganizationParticipantRef;

  if (organizationParticipantRefModel === undefined) {
    throw new Error(
      "unable to get organization participant reference by id because the organization participant reference model is undefined"
    );
  }

  const model = await organizationParticipantRefModel.findByPk(id);

  if (!model) {
    return;
  }

  const dbOrganizationParticipantRef = model.get();

  return map(dbOrganizationParticipantRef);
};

export const getOrganizationParticipantRefs = async (
  dbClient: DbClient,
  pageNumber: number,
  pageSize: number,
  searchCriteria?: {
    ids?: string[];
    organizationId?: string;
    participantId?: string;
    isAuthorizedSigner?: boolean;
    isAdministrator?: boolean;
  }
): Promise<{ count: number; rows: OrganizationParticipantRef[] }> => {
  const organizationParticipantRefModel =
    dbClient.sequelize?.models.OrganizationParticipantRef;

  if (organizationParticipantRefModel === undefined) {
    return { count: 0, rows: [] };
  }

  const { count, rows } = await organizationParticipantRefModel.findAndCountAll(
    {
      where: buildWhere(searchCriteria),
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
    throw new Error(
      "unable to create an organization participant reference because the organization participant reference model is undefined"
    );
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
    throw new Error(
      "unable to delete an organization participant reference because the organization participant reference model is undefined"
    );
  }

  const { id } = organizationParticipantRef;

  await organizationParticipantRefModel.destroy({
    where: {
      id,
    },
  });
};

export const updateOrganizationParticipantRef = async (
  dbClient: DbClient,
  updatedOrganizationParticipantRef: OrganizationParticipantRef
): Promise<void> => {
  const organizationParticipantRefModel =
    dbClient.sequelize?.models.OrganizationParticipantRef;

  if (organizationParticipantRefModel === undefined) {
    throw new Error(
      "unable to update an organization participant reference because the organization participant reference model is undefined"
    );
  }

  const {
    id,
    organizationId,
    participantId,
    isAuthorizedSigner,
    isAdministrator,
  } = updatedOrganizationParticipantRef;

  await organizationParticipantRefModel.update(
    {
      isAuthorizedSigner,
      isAdministrator,
    },
    {
      where: {
        id,
        organizationId,
        participantId,
      },
    }
  );

  return;
};
