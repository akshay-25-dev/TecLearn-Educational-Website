import { toast } from "react-hot-toast"

import { setLoading, setUser } from "../../slices/profileSlice"
import { apiConnector } from "../apiConnector"
import { profileEndpoints } from "../apis"
import { logout } from "./authAPI"

const {
  GET_USER_DETAILS_API,
  GET_USER_ENROLLED_COURSES_API,
  GET_INSTRUCTOR_DATA_API,
  GET_WISHLIST_API,
  ADD_TO_WISHLIST_API,
  REMOVE_FROM_WISHLIST_API,
} = profileEndpoints

export function getUserDetails(token, navigate) {
  return async (dispatch) => {
    const toastId = toast.loading("Loading...")
    dispatch(setLoading(true))
    try {
      const response = await apiConnector("GET", GET_USER_DETAILS_API, null, {
        Authorization: `Bearer ${token}`,
      })
      console.log("GET_USER_DETAILS API RESPONSE............", response)

      if (!response.data.success) {
        throw new Error(response.data.message)
      }
      const userImage = response.data.data.image
        ? response.data.data.image
        : `https://api.dicebear.com/5.x/initials/svg?seed=${response.data.data.firstName} ${response.data.data.lastName}`
      dispatch(setUser({ ...response.data.data, image: userImage }))
    } catch (error) {
      dispatch(logout(navigate))
      console.log("GET_USER_DETAILS API ERROR............", error)
      toast.error("Could Not Get User Details")
    }
    toast.dismiss(toastId)
    dispatch(setLoading(false))
  }
}

export async function getUserEnrolledCourses(token) {
  const toastId = toast.loading("Loading...")
  let result = []
  try {
    const response = await apiConnector(
      "GET",
      GET_USER_ENROLLED_COURSES_API,
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    )
    // console.log(
    //   "GET_USER_ENROLLED_COURSES_API API RESPONSE............",
    //   response
    // )

    if (!response.data.success) {
      throw new Error(response.data.message)
    }
    result = response.data.data
  } catch (error) {
    console.log("GET_USER_ENROLLED_COURSES_API API ERROR............", error)
    toast.error("Could Not Get Enrolled Courses")
  }
  toast.dismiss(toastId)
  return result
}

export async function getInstructorData(token) {
  const toastId = toast.loading("Loading...")
  let result = []
  try {
    const response = await apiConnector("GET", GET_INSTRUCTOR_DATA_API, null, {
      Authorization: `Bearer ${token}`,
    })
    console.log("GET_INSTRUCTOR_DATA_API API RESPONSE............", response)
    result = response?.data?.courses
  } catch (error) {
    console.log("GET_INSTRUCTOR_DATA_API API ERROR............", error)
    toast.error("Could Not Get Instructor Data")
  }
  toast.dismiss(toastId)
  return result
}

// Fetch the logged in student's wishlisted courses
export async function getWishlist(token) {
  let result = []
  try {
    const response = await apiConnector("GET", GET_WISHLIST_API, null, {
      Authorization: `Bearer ${token}`,
    })
    if (!response?.data?.success) {
      throw new Error(response?.data?.message)
    }
    result = response?.data?.data
  } catch (error) {
    console.log("GET_WISHLIST_API API ERROR............", error)
    toast.error("Could Not Get Wishlist")
  }
  return result
}

// Add a course to the wishlist. Returns the updated wishlist array, or null on failure.
export async function addToWishlist(courseId, token) {
  try {
    const response = await apiConnector(
      "POST",
      ADD_TO_WISHLIST_API,
      { courseId },
      { Authorization: `Bearer ${token}` }
    )
    if (!response?.data?.success) {
      throw new Error(response?.data?.message)
    }
    toast.success("Added to Wishlist")
    return response.data.data
  } catch (error) {
    console.log("ADD_TO_WISHLIST_API API ERROR............", error)
    toast.error("Could Not Add to Wishlist")
    return null
  }
}

// Remove a course from the wishlist. Returns the updated wishlist array, or null on failure.
export async function removeFromWishlist(courseId, token) {
  try {
    const response = await apiConnector(
      "POST",
      REMOVE_FROM_WISHLIST_API,
      { courseId },
      { Authorization: `Bearer ${token}` }
    )
    if (!response?.data?.success) {
      throw new Error(response?.data?.message)
    }
    toast.success("Removed from Wishlist")
    return response.data.data
  } catch (error) {
    console.log("REMOVE_FROM_WISHLIST_API API ERROR............", error)
    toast.error("Could Not Remove from Wishlist")
    return null
  }
}

