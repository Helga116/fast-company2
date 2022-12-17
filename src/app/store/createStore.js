import { combineReducers, configureStore } from "@reduxjs/toolkit";
import qualitiesReducer from "./qualities";
import professionReducer from "./professions";
import usersReducer from "./users";

const rootReducer = combineReducers({
    qualities: qualitiesReducer,
    profession: professionReducer,
    users: usersReducer
});

export function createStore() {
    return configureStore({
        reducer: rootReducer
    });
}
