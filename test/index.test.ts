import {
  blocksBroker,
  nodesBroker,
  participantsBroker,
  transactionsBroker,
  DbClient,
} from "../src";

describe("Index Tests", () => {
  it("should export brokers", () => {
    expect(blocksBroker).toBeTruthy();
    expect(nodesBroker).toBeTruthy();
    expect(participantsBroker).toBeTruthy();
    expect(transactionsBroker).toBeTruthy();
    expect(DbClient).toBeTruthy();
  });
});
