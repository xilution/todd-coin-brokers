import { Organization, OrganizationRole } from "@xilution/todd-coin-types";
import { DbClient } from "./db-client";
import { v4 } from "uuid";
import { OrganizationInstance, OrganizationParticipantRef } from "./types";
import { Model } from "sequelize";
import { buildWhere } from "./broker-utils";
import { getOrganizationParticipantRefByOrganizationId } from "./organization-participant-refs-broker";
import { DEFAULT_PAGE_SIZE } from "@xilution/todd-coin-constants";
import { getParticipants } from "./participants-broker";

const map = (dbOrganization: OrganizationInstance): Organization => ({
  id: dbOrganization.id,
  createdAt: dbOrganization.createdAt,
  updatedAt: dbOrganization.updatedAt,
  name: dbOrganization.name,
  email: dbOrganization.email,
  roles: dbOrganization.roles as OrganizationRole[],
});

const appendRelations = async (
  dbClient: DbClient,
  dbOrganization: OrganizationInstance
) => {
  const getOrganizationParticipantRefResponse =
    await getOrganizationParticipantRefByOrganizationId(
      dbClient,
      dbOrganization.id
    );

  const participantsResponse = await getParticipants(
    dbClient,
    0,
    DEFAULT_PAGE_SIZE,
    getOrganizationParticipantRefResponse.rows.reduce(
      (ids: string[], row: OrganizationParticipantRef) =>
        row.id ? ids.concat(row.id) : ids,
      []
    )
  );

  return { ...map(dbOrganization), participants: participantsResponse.rows };
};

export const getOrganizationById = async (
  dbClient: DbClient,
  id: string
): Promise<Organization | undefined> => {
  const organizationModel = dbClient.sequelize?.models.Organization;

  if (organizationModel === undefined) {
    return;
  }

  const model = await organizationModel.findByPk(id);

  if (!model) {
    return;
  }

  const dbOrganization = model.get();

  return appendRelations(dbClient, dbOrganization);
};

export const getOrganizations = async (
  dbClient: DbClient,
  pageNumber: number,
  pageSize: number,
  ids?: string[]
): Promise<{ count: number; rows: Organization[] }> => {
  const organizationModel = dbClient.sequelize?.models.Organization;

  if (organizationModel === undefined) {
    return { count: 0, rows: [] };
  }

  const { count, rows } = await organizationModel.findAndCountAll({
    where: buildWhere({ ids }),
    offset: pageNumber * pageSize,
    order: [["createdAt", "DESC"]],
    limit: pageSize,
  });

  return {
    count,
    rows: await Promise.all(
      rows.map(async (model: Model<OrganizationInstance>) => {
        const dbOrganization = model.get();

        return appendRelations(dbClient, dbOrganization);
      })
    ),
  };
};

export const createOrganization = async (
  dbClient: DbClient,
  newOrganization: Organization
): Promise<Organization | undefined> => {
  const organizationModel = dbClient.sequelize?.models.Organization;

  if (organizationModel === undefined) {
    return;
  }

  const model = await organizationModel.create({
    id: newOrganization.id || v4(),
    name: newOrganization.name,
    email: newOrganization.email,
    roles: newOrganization.roles,
  });

  const dbOrganization = model.get();

  return appendRelations(dbClient, dbOrganization);
};

export const updateOrganization = async (
  dbClient: DbClient,
  updatedOrganization: Organization
): Promise<void> => {
  const organizationModel = dbClient.sequelize?.models.Organization;

  if (organizationModel === undefined) {
    return;
  }

  const { id, email, name, phone, url, roles } = updatedOrganization;

  await organizationModel.update(
    {
      email,
      name,
      phone,
      url,
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
