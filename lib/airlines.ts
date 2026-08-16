/** Lightweight ICAO callsign-prefix directory used by the focused-flight card. */
export interface Airline {
  /** Three-letter ICAO designator found at the start of an ATC callsign. */
  readonly icao: string;
  /** Two-character IATA designator, when one is assigned. */
  readonly iata?: string;
  readonly name: string;
  readonly country: string;
  /** Spoken radiotelephony callsign. */
  readonly telephony?: string;
}

export const AIRLINES = [
  { icao: "AAL", iata: "AA", name: "American Airlines", country: "United States", telephony: "AMERICAN" },
  { icao: "UAL", iata: "UA", name: "United Airlines", country: "United States", telephony: "UNITED" },
  { icao: "DAL", iata: "DL", name: "Delta Air Lines", country: "United States", telephony: "DELTA" },
  { icao: "SWA", iata: "WN", name: "Southwest Airlines", country: "United States", telephony: "SOUTHWEST" },
  { icao: "ASA", iata: "AS", name: "Alaska Airlines", country: "United States", telephony: "ALASKA" },
  { icao: "JBU", iata: "B6", name: "JetBlue Airways", country: "United States", telephony: "JETBLUE" },
  { icao: "FFT", iata: "F9", name: "Frontier Airlines", country: "United States", telephony: "FRONTIER FLIGHT" },
  { icao: "NKS", iata: "NK", name: "Spirit Airlines", country: "United States", telephony: "SPIRIT WINGS" },
  { icao: "HAL", iata: "HA", name: "Hawaiian Airlines", country: "United States", telephony: "HAWAIIAN" },
  { icao: "AAY", iata: "G4", name: "Allegiant Air", country: "United States", telephony: "ALLEGIANT" },
  { icao: "SCX", iata: "SY", name: "Sun Country Airlines", country: "United States", telephony: "SUN COUNTRY" },
  { icao: "ACA", iata: "AC", name: "Air Canada", country: "Canada", telephony: "AIR CANADA" },
  { icao: "WJA", iata: "WS", name: "WestJet", country: "Canada", telephony: "WESTJET" },
  { icao: "TSC", iata: "TS", name: "Air Transat", country: "Canada", telephony: "AIR TRANSAT" },
  { icao: "AMX", iata: "AM", name: "Aeromexico", country: "Mexico", telephony: "AEROMEXICO" },
  { icao: "VOI", iata: "Y4", name: "Volaris", country: "Mexico", telephony: "VOLARIS" },
  { icao: "CMP", iata: "CM", name: "Copa Airlines", country: "Panama", telephony: "COPA" },
  { icao: "AVA", iata: "AV", name: "Avianca", country: "Colombia", telephony: "AVIANCA" },
  { icao: "LAN", iata: "LA", name: "LATAM Airlines", country: "Chile", telephony: "LAN" },
  { icao: "TAM", iata: "LA", name: "LATAM Brasil", country: "Brazil", telephony: "TAM" },
  { icao: "GLO", iata: "G3", name: "GOL Linhas Aereas", country: "Brazil", telephony: "GOL" },
  { icao: "AZU", iata: "AD", name: "Azul Brazilian Airlines", country: "Brazil", telephony: "AZUL" },
  { icao: "ARG", iata: "AR", name: "Aerolineas Argentinas", country: "Argentina", telephony: "ARGENTINA" },

  { icao: "BAW", iata: "BA", name: "British Airways", country: "United Kingdom", telephony: "SPEEDBIRD" },
  { icao: "EZY", iata: "U2", name: "easyJet", country: "United Kingdom", telephony: "EASY" },
  { icao: "RYR", iata: "FR", name: "Ryanair", country: "Ireland", telephony: "RYANAIR" },
  { icao: "VIR", iata: "VS", name: "Virgin Atlantic", country: "United Kingdom", telephony: "VIRGIN" },
  { icao: "AFR", iata: "AF", name: "Air France", country: "France", telephony: "AIRFRANS" },
  { icao: "KLM", iata: "KL", name: "KLM Royal Dutch Airlines", country: "Netherlands", telephony: "KLM" },
  { icao: "DLH", iata: "LH", name: "Lufthansa", country: "Germany", telephony: "LUFTHANSA" },
  { icao: "EWG", iata: "EW", name: "Eurowings", country: "Germany", telephony: "EUROWINGS" },
  { icao: "CFG", iata: "DE", name: "Condor", country: "Germany", telephony: "CONDOR" },
  { icao: "IBE", iata: "IB", name: "Iberia", country: "Spain", telephony: "IBERIA" },
  { icao: "VLG", iata: "VY", name: "Vueling", country: "Spain", telephony: "VUELING" },
  { icao: "TAP", iata: "TP", name: "TAP Air Portugal", country: "Portugal", telephony: "AIR PORTUGAL" },
  { icao: "ITY", iata: "AZ", name: "ITA Airways", country: "Italy", telephony: "ITARROW" },
  { icao: "SWR", iata: "LX", name: "SWISS", country: "Switzerland", telephony: "SWISS" },
  { icao: "AUA", iata: "OS", name: "Austrian Airlines", country: "Austria", telephony: "AUSTRIAN" },
  { icao: "BEL", iata: "SN", name: "Brussels Airlines", country: "Belgium", telephony: "BEE-LINE" },
  { icao: "SAS", iata: "SK", name: "Scandinavian Airlines", country: "Sweden", telephony: "SCANDINAVIAN" },
  { icao: "FIN", iata: "AY", name: "Finnair", country: "Finland", telephony: "FINNAIR" },
  { icao: "ICE", iata: "FI", name: "Icelandair", country: "Iceland", telephony: "ICEAIR" },
  { icao: "LOT", iata: "LO", name: "LOT Polish Airlines", country: "Poland", telephony: "LOT" },
  { icao: "THY", iata: "TK", name: "Turkish Airlines", country: "Turkey", telephony: "TURKISH" },
  { icao: "PGT", iata: "PC", name: "Pegasus Airlines", country: "Turkey", telephony: "SUNTURK" },
  { icao: "AEE", iata: "A3", name: "Aegean Airlines", country: "Greece", telephony: "AEGEAN" },
  { icao: "ROT", iata: "RO", name: "TAROM", country: "Romania", telephony: "TAROM" },

  { icao: "UAE", iata: "EK", name: "Emirates", country: "United Arab Emirates", telephony: "EMIRATES" },
  { icao: "ETD", iata: "EY", name: "Etihad Airways", country: "United Arab Emirates", telephony: "ETIHAD" },
  { icao: "QTR", iata: "QR", name: "Qatar Airways", country: "Qatar", telephony: "QATARI" },
  { icao: "GFA", iata: "GF", name: "Gulf Air", country: "Bahrain", telephony: "GULF AIR" },
  { icao: "OMA", iata: "WY", name: "Oman Air", country: "Oman", telephony: "OMAN AIR" },
  { icao: "SVA", iata: "SV", name: "Saudia", country: "Saudi Arabia", telephony: "SAUDIA" },
  { icao: "ELY", iata: "LY", name: "El Al Israel Airlines", country: "Israel", telephony: "ELAL" },
  { icao: "RJA", iata: "RJ", name: "Royal Jordanian", country: "Jordan", telephony: "JORDANIAN" },
  { icao: "IRM", iata: "W5", name: "Mahan Air", country: "Iran", telephony: "MAHAN AIR" },

  { icao: "THA", iata: "TG", name: "Thai Airways", country: "Thailand", telephony: "THAI" },
  { icao: "BKP", iata: "PG", name: "Bangkok Airways", country: "Thailand", telephony: "BANGKOK AIR" },
  { icao: "AIQ", iata: "FD", name: "Thai AirAsia", country: "Thailand", telephony: "THAI ASIA" },
  { icao: "TLM", iata: "SL", name: "Thai Lion Air", country: "Thailand", telephony: "MENTARI" },
  { icao: "NOK", iata: "DD", name: "Nok Air", country: "Thailand", telephony: "NOK AIR" },
  { icao: "SIA", iata: "SQ", name: "Singapore Airlines", country: "Singapore", telephony: "SINGAPORE" },
  { icao: "TGW", iata: "TR", name: "Scoot", country: "Singapore", telephony: "SCOOTER" },
  { icao: "MAS", iata: "MH", name: "Malaysia Airlines", country: "Malaysia", telephony: "MALAYSIAN" },
  { icao: "AXM", iata: "AK", name: "AirAsia", country: "Malaysia", telephony: "RED CAP" },
  { icao: "CPA", iata: "CX", name: "Cathay Pacific", country: "Hong Kong", telephony: "CATHAY" },
  { icao: "HDA", iata: "HX", name: "Hong Kong Airlines", country: "Hong Kong", telephony: "BAUHINIA" },
  { icao: "JAL", iata: "JL", name: "Japan Airlines", country: "Japan", telephony: "JAPANAIR" },
  { icao: "ANA", iata: "NH", name: "All Nippon Airways", country: "Japan", telephony: "ALL NIPPON" },
  { icao: "KAL", iata: "KE", name: "Korean Air", country: "South Korea", telephony: "KOREANAIR" },
  { icao: "AAR", iata: "OZ", name: "Asiana Airlines", country: "South Korea", telephony: "ASIANA" },
  { icao: "CCA", iata: "CA", name: "Air China", country: "China", telephony: "AIR CHINA" },
  { icao: "CES", iata: "MU", name: "China Eastern Airlines", country: "China", telephony: "CHINA EASTERN" },
  { icao: "CSN", iata: "CZ", name: "China Southern Airlines", country: "China", telephony: "CHINA SOUTHERN" },
  { icao: "CSZ", iata: "ZH", name: "Shenzhen Airlines", country: "China", telephony: "SHENZHEN AIR" },
  { icao: "CHH", iata: "HU", name: "Hainan Airlines", country: "China", telephony: "HAINAN" },
  { icao: "CAL", iata: "CI", name: "China Airlines", country: "Taiwan", telephony: "DYNASTY" },
  { icao: "EVA", iata: "BR", name: "EVA Air", country: "Taiwan", telephony: "EVA" },
  { icao: "PAL", iata: "PR", name: "Philippine Airlines", country: "Philippines", telephony: "PHILIPPINE" },
  { icao: "GIA", iata: "GA", name: "Garuda Indonesia", country: "Indonesia", telephony: "INDONESIA" },
  { icao: "VJC", iata: "VJ", name: "VietJet Air", country: "Vietnam", telephony: "VIETJETAIR" },
  { icao: "HVN", iata: "VN", name: "Vietnam Airlines", country: "Vietnam", telephony: "VIET NAM AIRLINES" },
  { icao: "AIC", iata: "AI", name: "Air India", country: "India", telephony: "AIR INDIA" },
  { icao: "IGO", iata: "6E", name: "IndiGo", country: "India", telephony: "IFLY" },
  { icao: "ALK", iata: "UL", name: "SriLankan Airlines", country: "Sri Lanka", telephony: "SRILANKAN" },

  { icao: "QFA", iata: "QF", name: "Qantas", country: "Australia", telephony: "QANTAS" },
  { icao: "VOZ", iata: "VA", name: "Virgin Australia", country: "Australia", telephony: "VELOCITY" },
  { icao: "JST", iata: "JQ", name: "Jetstar Airways", country: "Australia", telephony: "JETSTAR" },
  { icao: "ANZ", iata: "NZ", name: "Air New Zealand", country: "New Zealand", telephony: "NEW ZEALAND" },

  { icao: "ETH", iata: "ET", name: "Ethiopian Airlines", country: "Ethiopia", telephony: "ETHIOPIAN" },
  { icao: "SAA", iata: "SA", name: "South African Airways", country: "South Africa", telephony: "SPRINGBOK" },
  { icao: "KQA", iata: "KQ", name: "Kenya Airways", country: "Kenya", telephony: "KENYA" },
  { icao: "MSR", iata: "MS", name: "EgyptAir", country: "Egypt", telephony: "EGYPTAIR" },
  { icao: "RAM", iata: "AT", name: "Royal Air Maroc", country: "Morocco", telephony: "ROYALAIR MAROC" },

  { icao: "FDX", iata: "FX", name: "FedEx Express", country: "United States", telephony: "FEDEX" },
  { icao: "UPS", iata: "5X", name: "UPS Airlines", country: "United States", telephony: "UPS" },
  { icao: "GTI", iata: "5Y", name: "Atlas Air", country: "United States", telephony: "GIANT" },
  { icao: "CLX", iata: "CV", name: "Cargolux", country: "Luxembourg", telephony: "CARGOLUX" },
  { icao: "BOX", iata: "3S", name: "AeroLogic", country: "Germany", telephony: "GERMAN CARGO" },
] as const satisfies readonly Airline[];

export const AIRLINE_BY_ICAO: ReadonlyMap<string, Airline> = new Map(
  AIRLINES.map((airline) => [airline.icao, airline]),
);

/** Plain object form is convenient for serialisation and legacy consumers. */
export const AIRLINE_PREFIXES: Readonly<Record<string, string>> = Object.freeze(
  Object.fromEntries(AIRLINES.map((airline) => [airline.icao, airline.name])),
);

export function normalizeCallsign(callsign: string | null | undefined): string {
  return (callsign ?? "").trim().replace(/[\s-]+/g, "").toUpperCase();
}

/**
 * Expand a passenger-facing flight number into the ATC callsign forms that can
 * appear in an ADS-B state vector. For example, Mahan Air W590 may be broadcast
 * as IRM90 or IRM090. The original value is always the first alias.
 */
export function getFlightIdentifierAliases(value: string | null | undefined): string[] {
  const normalized = normalizeCallsign(value)
    .replace(/^(?:TRACK|FLT)/, "")
    .replace(/^@/, "")
    .replace(/[^A-Z0-9]/g, "");
  if (!normalized) return [];

  const aliases = new Set<string>([normalized]);
  const addIcaoNumericAliases = (icao: string, digits: string, letter: string): void => {
    const canonicalDigits = digits.replace(/^0+(?=\d)/, "");
    aliases.add(`${icao}${canonicalDigits}${letter}`);
    aliases.add(`${icao}${canonicalDigits.padStart(3, "0")}${letter}`);
    aliases.add(`${icao}${canonicalDigits.padStart(4, "0")}${letter}`);
  };

  const icaoCallsign = normalized.match(/^([A-Z]{3})(\d{1,4})([A-Z]?)$/);
  if (icaoCallsign) {
    const [, icao, digits, letter] = icaoCallsign;
    addIcaoNumericAliases(icao, digits, letter);
  }

  for (const airline of AIRLINES) {
    if (!airline.iata || !normalized.startsWith(airline.iata)) continue;
    const suffix = normalized.slice(airline.iata.length);
    const flightNumber = suffix.match(/^(\d{1,4})([A-Z]?)$/);
    if (!flightNumber) continue;
    const [, digits, letter] = flightNumber;
    addIcaoNumericAliases(airline.icao, digits, letter);
  }
  return [...aliases];
}

/** Return the airline whose three-letter ICAO prefix begins an ATC callsign. */
export function getAirlineForCallsign(callsign: string | null | undefined): Airline | undefined {
  const normalized = normalizeCallsign(callsign);
  if (!/^[A-Z]{3}/.test(normalized)) return undefined;
  return AIRLINE_BY_ICAO.get(normalized.slice(0, 3));
}

export const findAirlineByCallsign = getAirlineForCallsign;

/** A display-ready name with a deterministic fallback for private/unknown traffic. */
export function getAirlineName(
  callsign: string | null | undefined,
  fallback = "PRIVATE / UNKNOWN",
): string {
  return getAirlineForCallsign(callsign)?.name ?? fallback;
}
