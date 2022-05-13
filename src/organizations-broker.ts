import { Organization, OrganizationRole } from "@xilution/todd-coin-types";
import { DbClient } from "./db-client";
import { v4 } from "uuid";
import { OrganizationInstance, OrganizationParticipantRef } from "./types";
import { Model } from "sequelize";
import { buildWhere } from "./broker-utils";
import { DEFAULT_PAGE_SIZE } from "@xilution/todd-coin-constants";
import { getParticipants } from "./participants-broker";
import { getOrganizationParticipantRefs } from "./organization-participant-refs-broker";

const map = (dbOrganization: OrganizationInstance): Organization => ({
  id: dbOrganization.id,
  createdAt: dbOrganization.createdAt,
  updatedAt: dbOrganization.updatedAt,
  name: dbOrganization.name,
  email: dbOrganization.email,
  roles: dbOrganization.roles as OrganizationRole[],
  domains: dbOrganization.domains,
});

const appendRelations = async (
  dbClient: DbClient,
  dbOrganization: OrganizationInstance
): Promise<Organization> => {
  const getOrganizationParticipantRefResponse =
    await getOrganizationParticipantRefs(dbClient, 0, DEFAULT_PAGE_SIZE, {
      organizationId: dbOrganization.id,
    });

  const participantsResponse = await getParticipants(
    dbClient,
    0,
    DEFAULT_PAGE_SIZE,
    {
      ids: getOrganizationParticipantRefResponse.rows.reduce(
        (ids: string[], row: OrganizationParticipantRef) =>
          row.id ? ids.concat(row.id) : ids,
        []
      ),
    }
  );

  return { ...map(dbOrganization), participants: participantsResponse.rows };
};

export const getOrganizationById = async (
  dbClient: DbClient,
  id: string
): Promise<Organization | undefined> => {
  const organizationModel = dbClient.sequelize?.models.Organization;

  if (organizationModel === undefined) {
    throw new Error(
      "unable to get an organization by id because the organization model is undefined"
    );
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
  searchCriteria?: {
    ids?: string[];
    name?: string;
    phone?: string;
    url?: string;
  }
): Promise<{ count: number; rows: Organization[] }> => {
  const organizationModel = dbClient.sequelize?.models.Organization;

  if (organizationModel === undefined) {
    return { count: 0, rows: [] };
  }

  const { count, rows } = await organizationModel.findAndCountAll({
    where: buildWhere(searchCriteria),
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
    throw new Error(
      "unable to create an organization because the organization model is undefined"
    );
  }

  const model = await organizationModel.create({
    id: newOrganization.id || v4(),
    name: newOrganization.name,
    email: newOrganization.email,
    roles: newOrganization.roles,
    domains: newOrganization.domains,
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
    throw new Error(
      "unable to update an organization because the organization model is undefined"
    );
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
