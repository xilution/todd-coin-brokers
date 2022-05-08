import sequelize, { DataTypes, Sequelize } from "sequelize";
import {
  BlockInstance,
  NodeInstance,
  OrganizationInstance,
  OrganizationParticipantRefInstance,
  ParticipantInstance,
  ParticipantKeyInstance,
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
    this.sequelize = new Sequelize(database, username, password, {
      host,
      port,
      dialect: "postgres",
      logging: false,
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

    this.sequelize.define<OrganizationInstance>(
      "Organization",
      {
        id: {
          type: DataTypes.STRING,
          allowNull: false,
          primaryKey: true,
        },
        name: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        email: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        roles: {
          type: DataTypes.ARRAY(DataTypes.STRING),
          allowNull: false,
        },
        domains: {
          type: DataTypes.ARRAY(DataTypes.STRING),
          allowNull: true,
        },
      },
      {
        tableName: "organizations",
      }
    );

    this.sequelize.define<ParticipantKeyInstance>(
      "ParticipantKey",
      {
        id: {
          type: DataTypes.STRING,
          allowNull: false,
          primaryKey: true,
        },
        participantId: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        publicKey: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        effectiveFrom: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        effectiveTo: {
          type: DataTypes.STRING,
          allowNull: false,
        },
      },
      {
        tableName: "participant-keys",
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
        email: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        password: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        firstName: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        lastName: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        phone: {
          type: DataTypes.STRING,
          allowNull: true,
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

    this.sequelize.define<OrganizationParticipantRefInstance>(
      "OrganizationParticipantRef",
      {
        id: {
          type: DataTypes.STRING,
          allowNull: false,
          primaryKey: true,
        },
        organizationId: {
          type: DataTypes.STRING,
          allowNull: false,
          primaryKey: true,
        },
        participantId: {
          type: DataTypes.STRING,
          allowNull: false,
          primaryKey: true,
        },
        isAuthorizedSigner: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        isAdministrator: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
      },
      {
        tableName: "organization-participant-refs",
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
        state: {
          type: DataTypes.STRING,
          values: ["pending", "signed", "block"],
          allowNull: false,
        },
        type: {
          type: DataTypes.STRING,
          values: ["time", "treasure"],
          allowNull: false,
        },
        blockId: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        fromParticipant: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        fromOrganization: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        toParticipant: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        toOrganization: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        goodPoints: {
          type: DataTypes.BIGINT,
          allowNull: true,
        },
        description: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        details: {
          type: DataTypes.JSONB,
          allowNull: false,
        },
        participantKeyId: {
          type: DataTypes.STRING,
          allowNull: true,
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
        sequenceId: {
          type: DataTypes.INTEGER,
          allowNull: false,
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

    this.sequelize.models.Organization.belongsToMany(
      this.sequelize.models.Participant,
      {
        through: this.sequelize.models.OrganizationParticipantRef,
        foreignKey: "organizationId",
      }
    );

    this.sequelize.models.Participant.belongsToMany(
      this.sequelize.models.Organization,
      {
        through: this.sequelize.models.OrganizationParticipantRef,
        foreignKey: "participantId",
      }
    );

    await this.sequelize.sync({ force: false, alter: true });
  }

  async transaction<T>(
    autoCallback: (t: sequelize.Transaction) => PromiseLike<T>
  ): Promise<T | undefined> {
    return await this.sequelize?.transaction<T>(autoCallback);
  }
}
