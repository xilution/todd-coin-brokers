import { Organization, OrganizationRole } from "@xilution/todd-coin-types";
import { DbClient } from "./db-client";
import { v4 } from "uuid";
import { OrganizationInstance } from "./types";
import { Model } from "sequelize";
import { buildWhere } from "./broker-utils";

const map = (dbOrganization: OrganizationInstance): Organization => ({
  id: dbOrganization.id,
  createdAt: dbOrganization.createdAt,
  updatedAt: dbOrganization.updatedAt,
  name: dbOrganization.name,
  email: dbOrganization.email,
  roles: dbOrganization.roles as OrganizationRole[],
});

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

  return map(dbOrganization);
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
    rows: rows.map((model: Model<OrganizationInstance>) => {
      const dbOrganization = model.get();

      return map(dbOrganization);
    }),
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

  return map(dbOrganization);
};
