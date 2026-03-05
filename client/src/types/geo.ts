export interface Commune {
  fylkesNavn: string;
  fylkesNummer: string;
  kommuneNavn: string;
  kommuneNummer: string;
}

export interface GeoData {
  districts: unknown[];
  communes: Commune[];
}
