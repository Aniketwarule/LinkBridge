import { atom } from "recoil"

export const userState = atom({
    key: "userState",
    default: {
        userName: "",
        isLoading: true,
        isCompany: false,
    }
})