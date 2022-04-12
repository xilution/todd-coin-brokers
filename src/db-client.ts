import sequelize, { DataTypes, Sequelize } from "sequelize";
import { Block, Participant, Transaction } from "@xilution/todd-coin-types";
import { blockUtils } from "@xilution/todd-coin-utils";
import { Client } from "pg";
import {
  BlockInstance,
  NodeInstance,
  ParticipantInstance,
  TransactionInstance,
} from "./types";

export class DbClient {
  public sequelize: Sequelize | undefined;

  async init(
    database: string,
    username: string,
    password: string,
    host: string,
    port: number
  ) {
    let client;
    try {
      client = new Client({
        user: username,
        password,
        host,
        port,
      });
      await client.connect();
      await client.query(`CREATE DATABASE "${database}"`);
    } catch (error) {
      console.error(error);
    } finally {
      await client?.end();
    }

    this.sequelize = new Sequelize(database, username, password, {
      host,
      port,
      dialect: "postgres",
    });

    this.sequelize.define<NodeInstance>(
      "Node",
      {
        id: {
          type: DataTypes.STRING,
          allowNull: false,
          primaryKey: true,
        },
        baseUrl: {
          type: DataTypes.STRING,
          allowNull: false,
        },
      },
      {
        tableName: "nodes",
      }
    );

    this.sequelize.define<ParticipantInstance>(
      "Participant",
      {
        id: {
          type: DataTypes.STRING,
          allowNull: false,
          primaryKey: true,
        },
        firstName: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        lastName: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        email: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        phone: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        publicKey: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        roles: {
          type: DataTypes.ARRAY(DataTypes.STRING),
          allowNull: false,
        },
      },
      {
        tableName: "participants",
      }
    );

    this.sequelize.define<TransactionInstance>(
      "Transaction",
      {
        id: {
          type: DataTypes.STRING,
          allowNull: false,
          primaryKey: true,
        },
        type: {
          type: DataTypes.STRING,
          values: ["pending", "signed", "block"],
          allowNull: false,
        },
        blockId: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        from: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        to: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        amount: {
          type: DataTypes.BIGINT,
          allowNull: false,
        },
        description: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        signature: {
          type: DataTypes.STRING,
          allowNull: true,
        },
      },
      {
        tableName: "transactions",
      }
    );

    this.sequelize.define<BlockInstance>(
      "Block",
      {
        id: {
          type: DataTypes.STRING,
          allowNull: false,
          primaryKey: true,
        },
        nonce: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        previousHash: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        hash: {
          type: DataTypes.STRING,
          allowNull: false,
        },
      },
      {
        tableName: "blocks",
      }
    );

    this.sequelize.models.Block.hasMany(this.sequelize.models.Transaction, {
      foreignKey: "blockId",
    });

    await this.sequelize.sync({ force: false, alter: true });

    const genesisParticipant: Participant =
      blockUtils.createGenesisParticipant();

    await this.sequelize.models.Participant.findOrCreate({
      where: {
        id: genesisParticipant.id,
      },
      defaults: {
        ...genesisParticipant,
        publicKey: genesisParticipant.key.public,
      },
    });

    const genesisBlock: Block = blockUtils.createGenesisBlock();

    await this.sequelize.models.Block.findOrCreate({
      where: {
        id: genesisBlock.id,
      },
      defaults: {
        ...genesisBlock,
      },
    });

    const genesisBlockTransactions = genesisBlock.transactions;

    await Promise.all(
      genesisBlockTransactions.map(async (transaction: Transaction) => {
        return this.sequelize?.models.Transaction?.findOrCreate({
          where: {
            id: transaction.id,
          },
          defaults: {
            type: "block",
            blockId: genesisBlock.id,
            ...transaction,
          },
        });
      })
    );

    console.log("All models were synchronized successfully.");
  }

  async transaction<T>(
    autoCallback: (t: sequelize.Transaction) => PromiseLike<T>
  ): Promise<T | undefined> {
    return await this.sequelize?.transaction<T>(autoCallback);
  }
}
