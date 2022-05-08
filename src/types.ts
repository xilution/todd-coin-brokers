import { Model } from "sequelize";
import { TransactionDetails } from "@xilution/todd-coin-types";

export interface OrganizationParticipantRef {
  id?: string;
  createdAt?: string;
  updatedAt?: string;
  organizationId: string;
  participantId: string;
  isAuthorizedSigner: boolean;
  isAdministrator: boolean;
}

export interface NodeInstance extends Model {
  id: string;
  createdAt: string;
  updatedAt: string;
  baseUrl: string;
}

export interface OrganizationInstance extends Model {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  email: string;
  roles: string[];
}

export interface ParticipantKeyInstance extends Model {
  id: string;
  createdAt: string;
  updatedAt: string;
  participantId: string;
  publicKey: string;
  effectiveFrom: string;
  effectiveTo: string;
}

export interface ParticipantInstance extends Model {
  id: string;
  createdAt: string;
  updatedAt: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  roles: string[];
}

export interface OrganizationParticipantRefInstance extends Model {
  id: string;
  createdAt: string;
  updatedAt: string;
  organizationId: string;
  participantId: string;
  isAuthorizedSigner: boolean;
  isAdministrator: boolean;
}

export interface TransactionInstance extends Model {
  id: string;
  createdAt: string;
  updatedAt: string;
  state: string;
  type: string;
  blockId: string;
  fromParticipantId: string;
  fromOrganizationId: string;
  toParticipantId: string;
  toOrganizationId: string;
  goodPoints: number;
  description: string;
  details: TransactionDetails;
  signature: string;
  participantKeyId: string;
}

export interface BlockInstance extends Model {
  id: string;
  createdAt: string;
  updatedAt: string;
  sequenceId: number;
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
