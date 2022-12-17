import { createSlice, createAction } from "@reduxjs/toolkit";
import userService from "../services/user.service";
import authService from "../services/auth.service";
import localStorageService from "../services/localStorage.service";
import { randomInt } from "../utils/randomInt";
import history from "../utils/history";

const initialState = localStorageService.getAccessToken() ? {
    entities: null,
    isLoading: true,
    error: null,
    auth: { userId: localStorageService.getUserId() },
    isLoggedIn: true,
    dataLoaded: false
} : {
    entities: null,
    isLoading: false,
    error: null,
    auth: null,
    isLoggedIn: false,
    dataLoaded: false
};
const usersSlice = createSlice({
    name: "users",
    initialState,
    reducers: {
        usersRequested: (state) => {
            state.isLoading = true;
        },
        usersRecieved: (state, action) => {
            state.entities = action.payload;
            state.dataLoaded = true;
            state.isLoading = false;
        },
        usersRequestFailed: (state, action) => {
            state.error = action.payload;
            state.isLoading = false;
        },
        authRequestSuccess: (state, action) => {
            console.log(action.payload);
            state.auth = action.payload;
            state.isLoggedIn = true;
        },
        authRequestFailed: (state, action) => {
            state.error = action.payload;
        },
        userCreated: (state, action) => {
            if (!Array.isArray(state.entities)) {
                state.entities = [];
            }
            state.entities.push(action.payload);
        },
        userLoggedOut: (state) => {
            state.entities = null;
            state.isLoggedIn = false;
            state.auth = null;
            state.dataLoaded = false;
        },
        userUpdateRequestSuccessed: (state, action) => {
            state.entities[state.entities.findIndex(u => u._id === action.payload._id)] = action.payload;
        }
    }
});

const { reducer: usersReducer, actions } = usersSlice;
const { usersRequested, usersRecieved, usersRequestFailed, authRequestSuccess, authRequestFailed, userCreated, userLoggedOut, userUpdateRequestSuccessed } = actions;

const authRequested = createAction("users/authRequested");
const userCreateRequested = createAction("user/userCreateRequested");
const createUserFailed = createAction("user/createUserFailed");
const userUpdateFailed = createAction("users/userUpdateFailed");
const userUpdateRequested = createAction("users/userUpdateRequested");

export const logIn = ({ payload, redirect }) => async (dispatch) => {
    const { email, password } = payload;
    dispatch(authRequested());
    try {
        const data = await authService.login({ email, password });
        dispatch(authRequestSuccess({ userId: data.localId }));
        localStorageService.setTokens(data);
        history.push(redirect);
    } catch (error) {
        dispatch(authRequestFailed(error.message()));
    }
};
export const loadUsersList = () => async (dispatch) => {
        dispatch(usersRequested());
        try {
            const { content } = await userService.get();
            dispatch(usersRecieved(content));
        } catch (error) {
            dispatch(usersRequestFailed(error.message));
        }
};
export const logOut = () => async (dispatch) => {
    localStorageService.removeAuthData();
    dispatch(userLoggedOut());
    history.push("/");
};
export const updateUserData = (payload) => async (dispatch) => {
    dispatch(userUpdateRequested());
    try {
        const { content } = await userService.update(payload);
        dispatch(userUpdateRequestSuccessed(content));
        history.push(`/users/${content._id}`);
    } catch (error) {
        dispatch(userUpdateFailed(error.message));
    }
};

export const signUp = ({ email, password, ...rest }) => async (dispatch) => {
    dispatch(authRequested());
    try {
        const data = await authService.register({ email, password });
        dispatch(authRequestSuccess(data));
        localStorageService.setTokens(data);
        dispatch(authRequestSuccess({ userId: data.localId }));
        dispatch(createUser({
            _id: data.localId,
            email,
            rate: randomInt(1, 5),
            completedMeetings: randomInt(0, 200),
            image: `https://avatars.dicebear.com/api/avataaars/${(
                Math.random() + 1
            )
                .toString(36)
                .substring(7)}.svg`,
            ...rest
        }));
    } catch (error) {
        dispatch(authRequestFailed(error.message()));
    }
    function createUser(payload) {
        return async function (dispatch) {
            dispatch(userCreateRequested());
            try {
                const { content } = await userService.create(payload);
                dispatch(userCreated(content));
                history.push("/users");
            } catch (error) {
                dispatch(createUserFailed(error.message));
            }
        };
    }
};
export const getUsersList = () => (state) => state.users.entities;
export const getUserById = (userId) => (state) => {
    if (state.users.entities) {
        return state.users.entities.find(u => u._id === userId);
    }
};
export const getIsLoggedIn = () => (state) => state.users.isLoggedIn;
export const getDataStatus = () => (state) => state.users.dataLoaded;
export const getCurrentUserId = () => (state) => state.users.auth.userId;
export const getUsersLoadingStatus = () => (state) => state.users.isLoading;
export const getCurrentUserData = () => (state) => {
    return state.users.entities ? state.users.entities.find(u => u._id === state.users.auth.userId) : null;
};
export default usersReducer;
