import { appDataSliceActions } from "./appDataSlice";
import { useSelector } from "react-redux";

export const fetchNorwayDistricts = () => {
    return async (dispatch) => {
        const handleRequest = async () => {
            fetch('https://ws.geonorge.no/kommuneinfo/v1/fylkerkommuner', {method: 'GET'})
                .then(response => response.json())
                .then(data => {
                    var districtsArray = data;
                    var communeArray = [];
                    for (const item of districtsArray) {
                      for (const kommune of item.kommuner) {
                        communeArray.push({
                          fylkesNavn: kommune.fylkesnavn,
                          fylkesNummer: kommune.fylkesnummer,
                          kommuneNavn: kommune.kommunenavn,
                          kommuneNummer: kommune.kommunenummer,
                        });
                      }
                    }
                    dispatch(appDataSliceActions.setDistricts(data))
                    dispatch(appDataSliceActions.setCommunes(communeArray))
                });    
        }
        await handleRequest()
    }
}

export const useFindCommuneByPostnumber = () => {
    const communes = useSelector(state => state.app.communes)
    const communeFinder = (postnumber) => {
        postnumber = postnumber.toString()
        let matchedCommune = communes.find(item => item.kommuneNummer === postnumber);
        return matchedCommune;
    }
    return communeFinder;
}
