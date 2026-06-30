import type { DebtType, ExpenseCategory, GoalStatus } from "./types";

export const expenseCategoryOptions: Array<{ value: ExpenseCategory; label: string }> = [
  { value: "WATER", label: "Agua" },
  { value: "ENERGY", label: "Energia" },
  { value: "CONDOMINIUM", label: "Condominio" },
  { value: "RENT", label: "Aluguel" },
  { value: "IPVA", label: "IPVA" },
  { value: "IPTU", label: "IPTU" },
  { value: "INTERNET", label: "Internet" },
  { value: "HEALTH", label: "Saude" },
  { value: "EDUCATION", label: "Educacao" },
  { value: "TRANSPORT", label: "Transporte" },
  { value: "FOOD", label: "Alimentacao" },
  { value: "GROCERIES", label: "Mercado" },
  { value: "SHOPPING", label: "Compras" },
  { value: "LEISURE", label: "Lazer" },
  { value: "SUBSCRIPTION", label: "Assinatura" },
  { value: "MAINTENANCE", label: "Manutencao" },
  { value: "TAX", label: "Imposto" },
  { value: "DEBT_PAYMENT", label: "Divida" },
  { value: "OTHER", label: "Outro" }
];

export const debtTypeOptions: Array<{ value: DebtType; label: string }> = [
  { value: "INSTALLMENT", label: "Parcelada" },
  { value: "RECURRING", label: "Recorrente" },
  { value: "REVOLVING", label: "Rotativa" },
  { value: "INFORMAL_LOAN", label: "Emprestimo informal" },
  { value: "FINANCING", label: "Financiamento" },
  { value: "OTHER", label: "Outra" }
];

export const goalStatusOptions: Array<{ value: GoalStatus; label: string }> = [
  { value: "NOT_STARTED", label: "Nao iniciado" },
  { value: "IN_PROGRESS", label: "Em andamento" },
  { value: "ACHIEVED", label: "Concluido" }
];
