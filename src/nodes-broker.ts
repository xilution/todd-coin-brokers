import { Node } from "@xilution/todd-coin-types";
import { DbClient } from "./db-client";
import { v4 } from "uuid";
import { NodeInstance } from "./types";
import { Model } from "sequelize";

const map = (dbNode: NodeInstance): Node => ({
  id: dbNode.id,
  createdAt: dbNode.createdAt,
  updatedAt: dbNode.updatedAt,
  baseUrl: dbNode.baseUrl,
});

export const getNodeById = async (
  dbClient: DbClient,
  id: string
): Promise<Node | undefined> => {
  const nodeModel = dbClient.sequelize?.models.Node;

  if (nodeModel === undefined) {
    return;
  }

  const model = await nodeModel.findByPk(id);

  if (!model) {
    return;
  }

  const dbNode = model.get();

  return map(dbNode);
};

export const getNodes = async (
  dbClient: DbClient,
  pageNumber: number,
  pageSize: number
): Promise<{ count: number; rows: Node[] }> => {
  const nodeModel = dbClient.sequelize?.models.Node;

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
    rows: rows.map((model: Model<NodeInstance>) => {
      const dbNode = model.get();

      return map(dbNode);
    }),
  };
};

export const createNode = async (
  dbClient: DbClient,
  newNode: Node
): Promise<Node | undefined> => {
  const nodeModel = dbClient.sequelize?.models.Node;

  if (nodeModel === undefined) {
    return;
  }

  const model = await nodeModel.create({
    id: newNode.id || v4(),
    baseUrl: newNode.baseUrl,
  });

  const dbNode = model.get();

  return map(dbNode);
};
