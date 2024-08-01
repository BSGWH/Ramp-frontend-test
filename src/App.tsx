import { Fragment, useCallback, useEffect, useMemo, useState } from "react"
import { InputSelect } from "./components/InputSelect"
import { Instructions } from "./components/Instructions"
import { Transactions } from "./components/Transactions"
import { useEmployees } from "./hooks/useEmployees"
import { usePaginatedTransactions } from "./hooks/usePaginatedTransactions"
import { useTransactionsByEmployee } from "./hooks/useTransactionsByEmployee"
import { EMPTY_EMPLOYEE } from "./utils/constants"
import { Employee, Transaction } from "./utils/types"

export function App() {
  const { data: employees, loading: employeesLoading, fetchAll: fetchAllEmployees } = useEmployees()
  const {
    data: paginatedTransactions,
    loading: paginatedLoading,
    fetchAll: fetchAllPaginatedTransactions,
  } = usePaginatedTransactions()
  const { data: transactionsByEmployee, fetchById: fetchTransactionsByEmployee } =
    useTransactionsByEmployee()
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([])
  const [approvalStatus, setApprovalStatus] = useState<{ [key: string]: boolean }>({})
  const [hasMoreTransactions, setHasMoreTransactions] = useState(true)

  useEffect(() => {
    if (paginatedTransactions?.data) {
      setAllTransactions((prevTransactions) => [...prevTransactions, ...paginatedTransactions.data])
      setHasMoreTransactions(paginatedTransactions.nextPage !== null)
    }
  }, [paginatedTransactions])

  useEffect(() => {
    if (transactionsByEmployee) {
      setAllTransactions(transactionsByEmployee)
    }
  }, [transactionsByEmployee])

  const loadAllTransactions = useCallback(async () => {
    setAllTransactions([])
    await fetchAllEmployees()
    await fetchAllPaginatedTransactions()
  }, [fetchAllEmployees, fetchAllPaginatedTransactions])

  const loadTransactionsByEmployee = useCallback(
    async (employeeId: string) => {
      if (employeeId === "") {
        await loadAllTransactions()
      } else {
        setAllTransactions([])
        await fetchTransactionsByEmployee(employeeId)
      }
    },
    [loadAllTransactions, fetchTransactionsByEmployee]
  )

  useEffect(() => {
    if (employees === null && !employeesLoading) {
      loadAllTransactions()
    }
  }, [employeesLoading, employees, loadAllTransactions])

  const handleSetTransactionApproval = async ({
    transactionId,
    newValue,
  }: {
    transactionId: string
    newValue: boolean
  }) => {
    setApprovalStatus((prevStatus) => ({
      ...prevStatus,
      [transactionId]: newValue,
    }))
  }

  return (
    <Fragment>
      <main className="MainContainer">
        <Instructions />

        <hr className="RampBreak--l" />

        <InputSelect<Employee>
          isLoading={employeesLoading}
          defaultValue={EMPTY_EMPLOYEE}
          items={employees === null ? [] : [EMPTY_EMPLOYEE, ...employees]}
          label="Filter by employee"
          loadingLabel="Loading employees"
          parseItem={(item) => ({
            value: item.id,
            label: `${item.firstName} ${item.lastName}`,
          })}
          onChange={async (newValue) => {
            if (newValue === null) {
              return
            }

            await loadTransactionsByEmployee(newValue.id)
          }}
        />

        <div className="RampBreak--l" />

        <div className="RampGrid">
          <Transactions
            transactions={allTransactions}
            approvalStatus={approvalStatus}
            setTransactionApproval={handleSetTransactionApproval}
          />

          {hasMoreTransactions && (
            <button
              className="RampButton"
              disabled={paginatedLoading}
              onClick={async () => {
                await fetchAllPaginatedTransactions()
              }}
            >
              View More
            </button>
          )}
        </div>
      </main>
    </Fragment>
  )
}
