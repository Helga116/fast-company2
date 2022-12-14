import { createSlice } from "@reduxjs/toolkit";
import professionService from "../services/profession.service";

const professionSlice = createSlice({
    name: "professions",
    initialState: {
        entities: null,
        isLoading: true,
        error: null,
        lastFetch: null
    },
    reducers: {
        professionsRequested: (state) => {
            state.isLoading = true;
        },
        professionsRecieved: (state, action) => {
            state.entities = action.payload;
            state.lastFetch = Date.now();
            state.isLoading = false;
        },
        professionsRequestFailed: (state, action) => {
            state.error = action.payload;
            state.isLoading = false;
        }
    }
});

const { reducer: professionReducer, actions } = professionSlice;
const { professionsRecieved, professionsRequested, professionsRequestFailed } = actions;

// function isOutdated(date) {
//     if (Date.now() - date > 10 * 60 * 1000) {
//         return true;
//     }
//     return false;
// }

export const loadProfessionsList = () => async (dispatch) => {
        dispatch(professionsRequested());
        try {
            const { content } = await professionService.get();
            dispatch(professionsRecieved(content));
        } catch (error) {
            dispatch(professionsRequestFailed(error.message));
        }
};
export const getProfessions = () => (state) => state.profession.entities;
export const getProfessionsLoadingStatus = () => (state) => state.profession.isLoading;
export const getProfessionById = (id) => (state) => {
    if (state.profession.entities) {
        return state.profession.entities.find(p => p._id === id);
    }
};

export default professionReducer;
