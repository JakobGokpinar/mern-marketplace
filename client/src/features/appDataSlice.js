import { createSlice } from '@reduxjs/toolkit'

const appDataSlice = createSlice({
    name: 'app',
    initialState: {
        districts: [],
        communes: []
    },
    reducers: {
        setDistricts(state, action) {
            state.districts = action.payload;
        },
        setCommunes(state, action) {
            state.communes = action.payload
        },
        returnCommunesState(state) {
            return state.communes;
        }
    }
})

export const appDataSliceActions = appDataSlice.actions;

export default appDataSlice;