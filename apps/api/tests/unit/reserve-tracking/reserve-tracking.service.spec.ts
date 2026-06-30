import { beforeEach, describe, expect, it, vi } from "vitest";

import { RESERVE_ERROR_CODES } from "../../../src/modules/reserve-tracking/reserve-tracking.errors.js";
import type {
  EmergencyReserve,
  ReserveTransaction
} from "../../../src/modules/reserve-tracking/reserve-tracking.types.js";
import {
  configureUserReserve,
  depositToUserReserve,
  getUserReserve,
  listUserReserveTransactions,
  updateUserReserve,
  withdrawFromUserReserve
} from "../../../src/modules/reserve-tracking/reserve-tracking.service.js";

vi.mock("../../../src/modules/reserve-tracking/reserve-tracking.repository.js", () => ({
  createReserve: vi.fn(async (userId: string, protectionMonths: number) => ({ ...reserve, userId, protectionMonths })),
  findReserveByUserId: vi.fn(async () => reserve),
  getMonthlyFixedExpenseTotal: vi.fn(async () => 350000),
  listReserveTransactions: vi.fn(async () => [transaction]),
  moveReserve: vi.fn(async (_userId: string, inputReserve: EmergencyReserve, input: { amountInCents: number }, type) => {
    const currentBalanceInCents =
      type === "DEPOSIT"
        ? inputReserve.currentBalanceInCents + input.amountInCents
        : inputReserve.currentBalanceInCents - input.amountInCents;
    return {
      reserve: { ...inputReserve, currentBalanceInCents, status: currentBalanceInCents >= 2100000 ? "PROTECTED" : "BUILDING" },
      transaction: { ...transaction, type, amountInCents: input.amountInCents }
    };
  }),
  toPublicReserveTransaction: vi.fn((input: ReserveTransaction) => {
    const { userId: _userId, reserveId: _reserveId, ...publicTransaction } = input;
    return publicTransaction;
  }),
  updateReserve: vi.fn(async (_reserveId: string, protectionMonths: number) => ({ ...reserve, protectionMonths })),
  updateReserveStatus: vi.fn(async (inputReserve: EmergencyReserve, status: EmergencyReserve["status"]) => ({
    ...inputReserve,
    status
  }))
}));

const reserve: EmergencyReserve = {
  id: "reserve-id",
  userId: "user-id",
  protectionMonths: 6,
  currentBalanceInCents: 0,
  status: "BUILDING"
};

const transaction: ReserveTransaction = {
  id: "transaction-id",
  reserveId: reserve.id,
  userId: reserve.userId,
  type: "DEPOSIT",
  amountInCents: 50000,
  occurredAt: "2026-06-29",
  note: "Aporte"
};

describe("ReserveTrackingService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("configures a reserve for the authenticated user", async () => {
    const repository = await import("../../../src/modules/reserve-tracking/reserve-tracking.repository.js");
    vi.mocked(repository.findReserveByUserId).mockResolvedValueOnce(null);

    await expect(configureUserReserve("user-id", { protectionMonths: 6 })).resolves.toEqual({
      reserve: expect.objectContaining({ protectionMonths: 6, targetAmountInCents: 2100000 })
    });
  });

  it("rejects zero protection months", async () => {
    await expect(configureUserReserve("user-id", { protectionMonths: 0 })).rejects.toMatchObject({
      code: RESERVE_ERROR_CODES.invalidProtectionMonths
    });
  });

  it("rejects negative protection months", async () => {
    await expect(configureUserReserve("user-id", { protectionMonths: -1 })).rejects.toMatchObject({
      code: RESERVE_ERROR_CODES.invalidProtectionMonths
    });
  });

  it("rejects configuration without fixed expenses", async () => {
    const repository = await import("../../../src/modules/reserve-tracking/reserve-tracking.repository.js");
    vi.mocked(repository.findReserveByUserId).mockResolvedValueOnce(null);
    vi.mocked(repository.getMonthlyFixedExpenseTotal).mockResolvedValueOnce(0);

    await expect(configureUserReserve("user-id", { protectionMonths: 6 })).rejects.toMatchObject({
      code: RESERVE_ERROR_CODES.fixedExpensesRequired
    });
  });

  it("rejects duplicated configuration", async () => {
    await expect(configureUserReserve("user-id", { protectionMonths: 6 })).rejects.toMatchObject({
      code: RESERVE_ERROR_CODES.reserveAlreadyConfigured
    });
  });

  it("gets reserve with calculated target", async () => {
    await expect(getUserReserve("user-id")).resolves.toEqual({
      reserve: expect.objectContaining({ monthlyFixedExpensesInCents: 350000, targetAmountInCents: 2100000 }),
      setupRequired: false
    });
  });

  it("recalculates target after fixed expenses increase", async () => {
    const repository = await import("../../../src/modules/reserve-tracking/reserve-tracking.repository.js");
    vi.mocked(repository.getMonthlyFixedExpenseTotal).mockResolvedValueOnce(400000);

    const result = await getUserReserve("user-id");

    expect(result.reserve?.targetAmountInCents).toBe(2400000);
  });

  it("recalculates target after fixed expenses decrease", async () => {
    const repository = await import("../../../src/modules/reserve-tracking/reserve-tracking.repository.js");
    vi.mocked(repository.getMonthlyFixedExpenseTotal).mockResolvedValueOnce(300000);

    const result = await getUserReserve("user-id");

    expect(result.reserve?.targetAmountInCents).toBe(1800000);
  });

  it("updates protection months", async () => {
    await expect(updateUserReserve("user-id", { protectionMonths: 12 })).resolves.toEqual({
      reserve: expect.objectContaining({ protectionMonths: 12, targetAmountInCents: 4200000 })
    });
  });

  it("deposits into reserve", async () => {
    await expect(depositToUserReserve("user-id", { amountInCents: 50000 })).resolves.toEqual({
      reserve: expect.objectContaining({ currentBalanceInCents: 50000 }),
      transaction: expect.objectContaining({ type: "DEPOSIT", amountInCents: 50000 })
    });
  });

  it("withdraws from reserve", async () => {
    const repository = await import("../../../src/modules/reserve-tracking/reserve-tracking.repository.js");
    vi.mocked(repository.findReserveByUserId).mockResolvedValueOnce({ ...reserve, currentBalanceInCents: 100000 });

    await expect(withdrawFromUserReserve("user-id", { amountInCents: 30000 })).resolves.toEqual({
      reserve: expect.objectContaining({ currentBalanceInCents: 70000 }),
      transaction: expect.objectContaining({ type: "WITHDRAWAL", amountInCents: 30000 })
    });
  });

  it("rejects withdrawal greater than current balance", async () => {
    await expect(withdrawFromUserReserve("user-id", { amountInCents: 150000 })).rejects.toMatchObject({
      code: RESERVE_ERROR_CODES.withdrawalExceedsBalance
    });
  });

  it("lists reserve transactions", async () => {
    await expect(listUserReserveTransactions("user-id")).resolves.toEqual({
      transactions: [expect.objectContaining({ id: transaction.id })]
    });
  });

  it("changes status to PROTECTED", async () => {
    const repository = await import("../../../src/modules/reserve-tracking/reserve-tracking.repository.js");
    vi.mocked(repository.findReserveByUserId).mockResolvedValueOnce({ ...reserve, currentBalanceInCents: 2100000 });

    const result = await getUserReserve("user-id");

    expect(result.reserve?.status).toBe("PROTECTED");
  });

  it("changes status to REPLENISHING", async () => {
    const repository = await import("../../../src/modules/reserve-tracking/reserve-tracking.repository.js");
    vi.mocked(repository.findReserveByUserId).mockResolvedValueOnce({
      ...reserve,
      status: "PROTECTED",
      currentBalanceInCents: 2000000
    });

    const result = await getUserReserve("user-id");

    expect(result.reserve?.status).toBe("REPLENISHING");
  });

  it("returns setupRequired for a user without reserve", async () => {
    const repository = await import("../../../src/modules/reserve-tracking/reserve-tracking.repository.js");
    vi.mocked(repository.findReserveByUserId).mockResolvedValueOnce(null);

    await expect(getUserReserve("other-user")).resolves.toEqual({ reserve: null, setupRequired: true });
  });
});
