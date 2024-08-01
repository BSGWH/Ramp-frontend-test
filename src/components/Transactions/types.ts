import { Transaction } from "../../utils/types"
import { FunctionComponent } from "react"
export type SetTransactionApprovalFunction = (params: {
  transactionId: string
  newValue: boolean
}) => Promise<void>

type TransactionsProps = { 
  transactions: Transaction[] | null,
  approvalStatus: { [key: string]: boolean },
  setTransactionApproval: SetTransactionApprovalFunction
}

type TransactionPaneProps = {
  transaction: Transaction
  loading: boolean
  approved?: boolean
  setTransactionApproval: SetTransactionApprovalFunction
}

export type TransactionsComponent = FunctionComponent<TransactionsProps>
export type TransactionPaneComponent = FunctionComponent<TransactionPaneProps>
