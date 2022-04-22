import { Model } from "sequelize";

export interface NodeInstance extends Model {
  id: string;
  createdAt: string;
  updatedAt: string;
  baseUrl: string;
}

export interface ParticipantInstance extends Model {
  id: string;
  createdAt: string;
  updatedAt: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  publicKey: string;
  roles: string[];
}

export interface TransactionInstance extends Model {
  id: string;
  createdAt: string;
  updatedAt: string;
  type: string;
  blockId: string;
  from: string;
  to: string;
  amount: number;
  description: string;
  signature: string;
}

export interface BlockInstance extends Model {
  id: string;
  sequenceId: number;
  createdAt: string;
  updatedAt: string;
  nonce: number;
  previousHash: string;
  hash: string;
}

export interface DatabaseSettings {
  database: string;
  username: string;
  password: string;
  dbHost: string;
  dbPort: number;
}
