import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../lib/queryKeys';

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
  return { districts: data };
};

export const useNorwayGeo = () => {
  return useQuery({
    queryKey: queryKeys.geo.districts(),
    queryFn: fetchGeoData,
    staleTime: Infinity,
  });
};
