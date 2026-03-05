import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../lib/queryKeys';
import type { Commune } from '../types/geo';

interface FylkeKommune {
  fylkesnavn: string;
  fylkesnummer: string;
  kommunenavn: string;
  kommunenummer: string;
  kommuner?: FylkeKommune[];
}

const fetchGeoData = async () => {
  const res = await fetch('https://ws.geonorge.no/kommuneinfo/v1/fylkerkommuner');
  const data: FylkeKommune[] = await res.json();

  const communes: Commune[] = [];
  for (const item of data) {
    if (item.kommuner) {
      for (const kommune of item.kommuner) {
        communes.push({
          fylkesNavn: kommune.fylkesnavn,
          fylkesNummer: kommune.fylkesnummer,
          kommuneNavn: kommune.kommunenavn,
          kommuneNummer: kommune.kommunenummer,
        });
      }
    }
  }
  return { districts: data, communes };
};

export const useNorwayGeo = () => {
  return useQuery({
    queryKey: queryKeys.geo.districts(),
    queryFn: fetchGeoData,
    staleTime: Infinity,
  });
};

export const useFindCommuneByPostnumber = () => {
  const { data } = useNorwayGeo();
  const communes = data?.communes ?? [];

  return (postnumber: string | number): Commune | undefined => {
    const normalized = postnumber.toString();
    return communes.find((item) => item.kommuneNummer === normalized);
  };
};
