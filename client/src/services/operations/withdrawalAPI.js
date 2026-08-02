import { toast } from "react-hot-toast"

import { apiConnector } from "../apiConnector"
import { withdrawalEndpoints } from "../apis"

const { GET_WITHDRAWALS_API, REQUEST_WITHDRAWAL_API } = withdrawalEndpoints

// Fetch the instructor's balance summary (total earned, total withdrawn,
// available balance) plus their full withdrawal request history.
export async function getWithdrawals(token) {
  let result = null
  try {
    const response = await apiConnector("GET", GET_WITHDRAWALS_API, null, {
      Authorization: `Bearer ${token}`,
    })
    if (!response?.data?.success) {
      throw new Error(response?.data?.message)
    }
    result = response?.data?.data
  } catch (error) {
    console.log("GET_WITHDRAWALS_API API ERROR............", error)
    toast.error("Could Not Get Withdrawals")
  }
  return result
}

// Submit a new withdrawal request. Returns true on success so the caller
// can refresh the balance/history.
export async function requestWithdrawal(amount, note, token) {
  const toastId = toast.loading("Submitting request...")
  let success = false
  try {
    const response = await apiConnector(
      "POST",
      REQUEST_WITHDRAWAL_API,
      { amount, note },
      { Authorization: `Bearer ${token}` }
    )
    if (!response?.data?.success) {
      throw new Error(response?.data?.message)
    }
    toast.success("Withdrawal request submitted")
    success = true
  } catch (error) {
    console.log("REQUEST_WITHDRAWAL_API API ERROR............", error)
    toast.error(error.message || "Could Not Submit Withdrawal Request")
  }
  toast.dismiss(toastId)
  return success
}
