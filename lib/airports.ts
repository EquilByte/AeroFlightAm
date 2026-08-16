/**
 * A deliberately compact airport catalogue for the dashboard search box.
 *
 * It favours large international airports and broad geographic coverage over
 * trying to duplicate a multi-megabyte aviation database in the client bundle.
 * All coordinates are WGS84 decimal degrees.
 */
export interface Airport {
  readonly iata: string;
  readonly icao: string;
  readonly name: string;
  readonly city: string;
  readonly country: string;
  readonly latitude: number;
  readonly longitude: number;
  /** IANA timezone name. */
  readonly timezone: string;
  /** Optional terms commonly used when searching for this airport. */
  readonly keywords?: readonly string[];
}

export const AIRPORTS = [
  { iata: "ATL", icao: "KATL", name: "Hartsfield-Jackson Atlanta International", city: "Atlanta", country: "United States", latitude: 33.6407, longitude: -84.4277, timezone: "America/New_York" },
  { iata: "LAX", icao: "KLAX", name: "Los Angeles International", city: "Los Angeles", country: "United States", latitude: 33.9416, longitude: -118.4085, timezone: "America/Los_Angeles" },
  { iata: "ORD", icao: "KORD", name: "O'Hare International", city: "Chicago", country: "United States", latitude: 41.9742, longitude: -87.9073, timezone: "America/Chicago", keywords: ["O'Hare"] },
  { iata: "DFW", icao: "KDFW", name: "Dallas Fort Worth International", city: "Dallas", country: "United States", latitude: 32.8998, longitude: -97.0403, timezone: "America/Chicago", keywords: ["Fort Worth"] },
  { iata: "DEN", icao: "KDEN", name: "Denver International", city: "Denver", country: "United States", latitude: 39.8561, longitude: -104.6737, timezone: "America/Denver" },
  { iata: "JFK", icao: "KJFK", name: "John F. Kennedy International", city: "New York", country: "United States", latitude: 40.6413, longitude: -73.7781, timezone: "America/New_York" },
  { iata: "SFO", icao: "KSFO", name: "San Francisco International", city: "San Francisco", country: "United States", latitude: 37.6213, longitude: -122.379, timezone: "America/Los_Angeles" },
  { iata: "SEA", icao: "KSEA", name: "Seattle-Tacoma International", city: "Seattle", country: "United States", latitude: 47.4502, longitude: -122.3088, timezone: "America/Los_Angeles", keywords: ["SeaTac", "Tacoma"] },
  { iata: "MIA", icao: "KMIA", name: "Miami International", city: "Miami", country: "United States", latitude: 25.7959, longitude: -80.287, timezone: "America/New_York" },
  { iata: "BOS", icao: "KBOS", name: "Logan International", city: "Boston", country: "United States", latitude: 42.3656, longitude: -71.0096, timezone: "America/New_York", keywords: ["Logan"] },
  { iata: "IAD", icao: "KIAD", name: "Washington Dulles International", city: "Washington", country: "United States", latitude: 38.9531, longitude: -77.4565, timezone: "America/New_York", keywords: ["Dulles"] },
  { iata: "HNL", icao: "PHNL", name: "Daniel K. Inouye International", city: "Honolulu", country: "United States", latitude: 21.3187, longitude: -157.9225, timezone: "Pacific/Honolulu" },
  { iata: "ANC", icao: "PANC", name: "Ted Stevens Anchorage International", city: "Anchorage", country: "United States", latitude: 61.1743, longitude: -149.9985, timezone: "America/Anchorage" },
  { iata: "YYZ", icao: "CYYZ", name: "Toronto Pearson International", city: "Toronto", country: "Canada", latitude: 43.6777, longitude: -79.6248, timezone: "America/Toronto", keywords: ["Pearson"] },
  { iata: "YVR", icao: "CYVR", name: "Vancouver International", city: "Vancouver", country: "Canada", latitude: 49.1967, longitude: -123.1815, timezone: "America/Vancouver" },
  { iata: "YUL", icao: "CYUL", name: "Montreal-Trudeau International", city: "Montreal", country: "Canada", latitude: 45.4706, longitude: -73.7408, timezone: "America/Toronto", keywords: ["Trudeau"] },
  { iata: "MEX", icao: "MMMX", name: "Mexico City International", city: "Mexico City", country: "Mexico", latitude: 19.4361, longitude: -99.0719, timezone: "America/Mexico_City", keywords: ["Benito Juarez"] },
  { iata: "GRU", icao: "SBGR", name: "Sao Paulo-Guarulhos International", city: "Sao Paulo", country: "Brazil", latitude: -23.4356, longitude: -46.4731, timezone: "America/Sao_Paulo", keywords: ["Guarulhos"] },
  { iata: "GIG", icao: "SBGL", name: "Rio de Janeiro-Galeao International", city: "Rio de Janeiro", country: "Brazil", latitude: -22.809, longitude: -43.2506, timezone: "America/Sao_Paulo", keywords: ["Galeao"] },
  { iata: "EZE", icao: "SAEZ", name: "Ministro Pistarini International", city: "Buenos Aires", country: "Argentina", latitude: -34.8222, longitude: -58.5358, timezone: "America/Argentina/Buenos_Aires", keywords: ["Ezeiza"] },
  { iata: "SCL", icao: "SCEL", name: "Arturo Merino Benitez International", city: "Santiago", country: "Chile", latitude: -33.3929, longitude: -70.7858, timezone: "America/Santiago" },
  { iata: "BOG", icao: "SKBO", name: "El Dorado International", city: "Bogota", country: "Colombia", latitude: 4.7016, longitude: -74.1469, timezone: "America/Bogota" },
  { iata: "LIM", icao: "SPJC", name: "Jorge Chavez International", city: "Lima", country: "Peru", latitude: -12.0219, longitude: -77.1143, timezone: "America/Lima" },
  { iata: "UIO", icao: "SEQM", name: "Mariscal Sucre International", city: "Quito", country: "Ecuador", latitude: -0.1292, longitude: -78.3575, timezone: "America/Guayaquil" },

  { iata: "LHR", icao: "EGLL", name: "Heathrow", city: "London", country: "United Kingdom", latitude: 51.47, longitude: -0.4543, timezone: "Europe/London", keywords: ["London Heathrow"] },
  { iata: "LGW", icao: "EGKK", name: "Gatwick", city: "London", country: "United Kingdom", latitude: 51.1537, longitude: -0.1821, timezone: "Europe/London", keywords: ["London Gatwick"] },
  { iata: "CDG", icao: "LFPG", name: "Charles de Gaulle", city: "Paris", country: "France", latitude: 49.0097, longitude: 2.5479, timezone: "Europe/Paris", keywords: ["Roissy"] },
  { iata: "ORY", icao: "LFPO", name: "Paris Orly", city: "Paris", country: "France", latitude: 48.7262, longitude: 2.3652, timezone: "Europe/Paris" },
  { iata: "AMS", icao: "EHAM", name: "Amsterdam Airport Schiphol", city: "Amsterdam", country: "Netherlands", latitude: 52.3105, longitude: 4.7683, timezone: "Europe/Amsterdam", keywords: ["Schiphol"] },
  { iata: "FRA", icao: "EDDF", name: "Frankfurt Airport", city: "Frankfurt", country: "Germany", latitude: 50.0379, longitude: 8.5622, timezone: "Europe/Berlin" },
  { iata: "MUC", icao: "EDDM", name: "Munich Airport", city: "Munich", country: "Germany", latitude: 48.3538, longitude: 11.7861, timezone: "Europe/Berlin" },
  { iata: "BER", icao: "EDDB", name: "Berlin Brandenburg", city: "Berlin", country: "Germany", latitude: 52.3667, longitude: 13.5033, timezone: "Europe/Berlin" },
  { iata: "MAD", icao: "LEMD", name: "Adolfo Suarez Madrid-Barajas", city: "Madrid", country: "Spain", latitude: 40.4983, longitude: -3.5676, timezone: "Europe/Madrid", keywords: ["Barajas"] },
  { iata: "BCN", icao: "LEBL", name: "Barcelona-El Prat", city: "Barcelona", country: "Spain", latitude: 41.2974, longitude: 2.0833, timezone: "Europe/Madrid", keywords: ["El Prat"] },
  { iata: "FCO", icao: "LIRF", name: "Leonardo da Vinci-Fiumicino", city: "Rome", country: "Italy", latitude: 41.8003, longitude: 12.2389, timezone: "Europe/Rome", keywords: ["Fiumicino"] },
  { iata: "MXP", icao: "LIMC", name: "Milan Malpensa", city: "Milan", country: "Italy", latitude: 45.63, longitude: 8.7231, timezone: "Europe/Rome", keywords: ["Malpensa"] },
  { iata: "ZRH", icao: "LSZH", name: "Zurich Airport", city: "Zurich", country: "Switzerland", latitude: 47.4581, longitude: 8.5555, timezone: "Europe/Zurich" },
  { iata: "VIE", icao: "LOWW", name: "Vienna International", city: "Vienna", country: "Austria", latitude: 48.1103, longitude: 16.5697, timezone: "Europe/Vienna" },
  { iata: "CPH", icao: "EKCH", name: "Copenhagen Airport", city: "Copenhagen", country: "Denmark", latitude: 55.618, longitude: 12.6508, timezone: "Europe/Copenhagen" },
  { iata: "ARN", icao: "ESSA", name: "Stockholm Arlanda", city: "Stockholm", country: "Sweden", latitude: 59.6519, longitude: 17.9186, timezone: "Europe/Stockholm", keywords: ["Arlanda"] },
  { iata: "OSL", icao: "ENGM", name: "Oslo Gardermoen", city: "Oslo", country: "Norway", latitude: 60.1939, longitude: 11.1004, timezone: "Europe/Oslo", keywords: ["Gardermoen"] },
  { iata: "HEL", icao: "EFHK", name: "Helsinki Airport", city: "Helsinki", country: "Finland", latitude: 60.3172, longitude: 24.9633, timezone: "Europe/Helsinki" },
  { iata: "DUB", icao: "EIDW", name: "Dublin Airport", city: "Dublin", country: "Ireland", latitude: 53.4213, longitude: -6.2701, timezone: "Europe/Dublin" },
  { iata: "LIS", icao: "LPPT", name: "Humberto Delgado Airport", city: "Lisbon", country: "Portugal", latitude: 38.7742, longitude: -9.1342, timezone: "Europe/Lisbon" },
  { iata: "ATH", icao: "LGAV", name: "Athens International", city: "Athens", country: "Greece", latitude: 37.9364, longitude: 23.9445, timezone: "Europe/Athens" },
  { iata: "IST", icao: "LTFM", name: "Istanbul Airport", city: "Istanbul", country: "Turkey", latitude: 41.2753, longitude: 28.7519, timezone: "Europe/Istanbul" },
  { iata: "KEF", icao: "BIKF", name: "Keflavik International", city: "Reykjavik", country: "Iceland", latitude: 63.985, longitude: -22.6056, timezone: "Atlantic/Reykjavik", keywords: ["Reykjavik"] },
  { iata: "WAW", icao: "EPWA", name: "Warsaw Chopin", city: "Warsaw", country: "Poland", latitude: 52.1657, longitude: 20.9671, timezone: "Europe/Warsaw", keywords: ["Chopin"] },
  { iata: "PRG", icao: "LKPR", name: "Vaclav Havel Airport Prague", city: "Prague", country: "Czechia", latitude: 50.1008, longitude: 14.26, timezone: "Europe/Prague" },
  { iata: "BRU", icao: "EBBR", name: "Brussels Airport", city: "Brussels", country: "Belgium", latitude: 50.9014, longitude: 4.4844, timezone: "Europe/Brussels" },
  { iata: "SVO", icao: "UUEE", name: "Sheremetyevo International", city: "Moscow", country: "Russia", latitude: 55.9726, longitude: 37.4146, timezone: "Europe/Moscow", keywords: ["Sheremetyevo"] },
  { iata: "DME", icao: "UUDD", name: "Domodedovo International", city: "Moscow", country: "Russia", latitude: 55.4088, longitude: 37.9063, timezone: "Europe/Moscow", keywords: ["Domodedovo"] },

  { iata: "DXB", icao: "OMDB", name: "Dubai International", city: "Dubai", country: "United Arab Emirates", latitude: 25.2532, longitude: 55.3657, timezone: "Asia/Dubai" },
  { iata: "AUH", icao: "OMAA", name: "Zayed International", city: "Abu Dhabi", country: "United Arab Emirates", latitude: 24.433, longitude: 54.6511, timezone: "Asia/Dubai" },
  { iata: "DOH", icao: "OTHH", name: "Hamad International", city: "Doha", country: "Qatar", latitude: 25.2731, longitude: 51.6081, timezone: "Asia/Qatar" },
  { iata: "TLV", icao: "LLBG", name: "Ben Gurion International", city: "Tel Aviv", country: "Israel", latitude: 32.0114, longitude: 34.8867, timezone: "Asia/Jerusalem" },
  { iata: "RUH", icao: "OERK", name: "King Khalid International", city: "Riyadh", country: "Saudi Arabia", latitude: 24.9576, longitude: 46.6988, timezone: "Asia/Riyadh" },
  { iata: "JED", icao: "OEJN", name: "King Abdulaziz International", city: "Jeddah", country: "Saudi Arabia", latitude: 21.6702, longitude: 39.1525, timezone: "Asia/Riyadh" },

  { iata: "CAI", icao: "HECA", name: "Cairo International", city: "Cairo", country: "Egypt", latitude: 30.1219, longitude: 31.4056, timezone: "Africa/Cairo" },
  { iata: "JNB", icao: "FAOR", name: "O. R. Tambo International", city: "Johannesburg", country: "South Africa", latitude: -26.1337, longitude: 28.242, timezone: "Africa/Johannesburg", keywords: ["Tambo"] },
  { iata: "CPT", icao: "FACT", name: "Cape Town International", city: "Cape Town", country: "South Africa", latitude: -33.97, longitude: 18.5972, timezone: "Africa/Johannesburg" },
  { iata: "ADD", icao: "HAAB", name: "Addis Ababa Bole International", city: "Addis Ababa", country: "Ethiopia", latitude: 8.9779, longitude: 38.7993, timezone: "Africa/Addis_Ababa", keywords: ["Bole"] },
  { iata: "NBO", icao: "HKJK", name: "Jomo Kenyatta International", city: "Nairobi", country: "Kenya", latitude: -1.3192, longitude: 36.9278, timezone: "Africa/Nairobi" },
  { iata: "CMN", icao: "GMMN", name: "Mohammed V International", city: "Casablanca", country: "Morocco", latitude: 33.3675, longitude: -7.59, timezone: "Africa/Casablanca" },
  { iata: "LOS", icao: "DNMM", name: "Murtala Muhammed International", city: "Lagos", country: "Nigeria", latitude: 6.5774, longitude: 3.3212, timezone: "Africa/Lagos" },

  { iata: "BKK", icao: "VTBS", name: "Suvarnabhumi Airport", city: "Bangkok", country: "Thailand", latitude: 13.69, longitude: 100.7501, timezone: "Asia/Bangkok", keywords: ["Suvarnabhumi"] },
  { iata: "DMK", icao: "VTBD", name: "Don Mueang International", city: "Bangkok", country: "Thailand", latitude: 13.9126, longitude: 100.6068, timezone: "Asia/Bangkok", keywords: ["Don Muang"] },
  { iata: "SIN", icao: "WSSS", name: "Singapore Changi", city: "Singapore", country: "Singapore", latitude: 1.3644, longitude: 103.9915, timezone: "Asia/Singapore", keywords: ["Changi"] },
  { iata: "HKG", icao: "VHHH", name: "Hong Kong International", city: "Hong Kong", country: "Hong Kong", latitude: 22.308, longitude: 113.9185, timezone: "Asia/Hong_Kong", keywords: ["Chek Lap Kok"] },
  { iata: "HND", icao: "RJTT", name: "Tokyo Haneda", city: "Tokyo", country: "Japan", latitude: 35.5494, longitude: 139.7798, timezone: "Asia/Tokyo", keywords: ["Haneda"] },
  { iata: "NRT", icao: "RJAA", name: "Narita International", city: "Tokyo", country: "Japan", latitude: 35.772, longitude: 140.3929, timezone: "Asia/Tokyo", keywords: ["Narita"] },
  { iata: "ICN", icao: "RKSI", name: "Incheon International", city: "Seoul", country: "South Korea", latitude: 37.4602, longitude: 126.4407, timezone: "Asia/Seoul", keywords: ["Incheon"] },
  { iata: "GMP", icao: "RKSS", name: "Gimpo International", city: "Seoul", country: "South Korea", latitude: 37.5583, longitude: 126.7906, timezone: "Asia/Seoul", keywords: ["Gimpo"] },
  { iata: "PEK", icao: "ZBAA", name: "Beijing Capital International", city: "Beijing", country: "China", latitude: 40.0799, longitude: 116.6031, timezone: "Asia/Shanghai", keywords: ["Capital"] },
  { iata: "PKX", icao: "ZBAD", name: "Beijing Daxing International", city: "Beijing", country: "China", latitude: 39.5098, longitude: 116.4105, timezone: "Asia/Shanghai", keywords: ["Daxing"] },
  { iata: "PVG", icao: "ZSPD", name: "Shanghai Pudong International", city: "Shanghai", country: "China", latitude: 31.1443, longitude: 121.8083, timezone: "Asia/Shanghai", keywords: ["Pudong"] },
  { iata: "CAN", icao: "ZGGG", name: "Guangzhou Baiyun International", city: "Guangzhou", country: "China", latitude: 23.3924, longitude: 113.2988, timezone: "Asia/Shanghai", keywords: ["Baiyun"] },
  { iata: "SZX", icao: "ZGSZ", name: "Shenzhen Bao'an International", city: "Shenzhen", country: "China", latitude: 22.6393, longitude: 113.8107, timezone: "Asia/Shanghai" },
  { iata: "TPE", icao: "RCTP", name: "Taiwan Taoyuan International", city: "Taipei", country: "Taiwan", latitude: 25.0797, longitude: 121.2342, timezone: "Asia/Taipei", keywords: ["Taoyuan"] },
  { iata: "KUL", icao: "WMKK", name: "Kuala Lumpur International", city: "Kuala Lumpur", country: "Malaysia", latitude: 2.7456, longitude: 101.7099, timezone: "Asia/Kuala_Lumpur" },
  { iata: "CGK", icao: "WIII", name: "Soekarno-Hatta International", city: "Jakarta", country: "Indonesia", latitude: -6.1256, longitude: 106.6559, timezone: "Asia/Jakarta", keywords: ["Soekarno Hatta"] },
  { iata: "DPS", icao: "WADD", name: "I Gusti Ngurah Rai International", city: "Denpasar", country: "Indonesia", latitude: -8.7482, longitude: 115.1672, timezone: "Asia/Makassar", keywords: ["Bali"] },
  { iata: "MNL", icao: "RPLL", name: "Ninoy Aquino International", city: "Manila", country: "Philippines", latitude: 14.5086, longitude: 121.0198, timezone: "Asia/Manila" },
  { iata: "HAN", icao: "VVNB", name: "Noi Bai International", city: "Hanoi", country: "Vietnam", latitude: 21.2212, longitude: 105.8072, timezone: "Asia/Ho_Chi_Minh", keywords: ["Noi Bai"] },
  { iata: "SGN", icao: "VVTS", name: "Tan Son Nhat International", city: "Ho Chi Minh City", country: "Vietnam", latitude: 10.8188, longitude: 106.652, timezone: "Asia/Ho_Chi_Minh", keywords: ["Saigon"] },
  { iata: "DEL", icao: "VIDP", name: "Indira Gandhi International", city: "Delhi", country: "India", latitude: 28.5562, longitude: 77.1, timezone: "Asia/Kolkata" },
  { iata: "BOM", icao: "VABB", name: "Chhatrapati Shivaji Maharaj International", city: "Mumbai", country: "India", latitude: 19.0896, longitude: 72.8656, timezone: "Asia/Kolkata", keywords: ["Bombay"] },
  { iata: "BLR", icao: "VOBL", name: "Kempegowda International", city: "Bengaluru", country: "India", latitude: 13.1986, longitude: 77.7066, timezone: "Asia/Kolkata", keywords: ["Bangalore"] },
  { iata: "CCU", icao: "VECC", name: "Netaji Subhas Chandra Bose International", city: "Kolkata", country: "India", latitude: 22.6547, longitude: 88.4467, timezone: "Asia/Kolkata", keywords: ["Calcutta"] },
  { iata: "DAC", icao: "VGHS", name: "Hazrat Shahjalal International", city: "Dhaka", country: "Bangladesh", latitude: 23.8433, longitude: 90.3978, timezone: "Asia/Dhaka" },
  { iata: "KTM", icao: "VNKT", name: "Tribhuvan International", city: "Kathmandu", country: "Nepal", latitude: 27.6966, longitude: 85.3591, timezone: "Asia/Kathmandu" },
  { iata: "CMB", icao: "VCBI", name: "Bandaranaike International", city: "Colombo", country: "Sri Lanka", latitude: 7.1808, longitude: 79.8841, timezone: "Asia/Colombo" },

  { iata: "SYD", icao: "YSSY", name: "Sydney Kingsford Smith", city: "Sydney", country: "Australia", latitude: -33.9399, longitude: 151.1753, timezone: "Australia/Sydney", keywords: ["Kingsford Smith"] },
  { iata: "MEL", icao: "YMML", name: "Melbourne Airport", city: "Melbourne", country: "Australia", latitude: -37.669, longitude: 144.841, timezone: "Australia/Melbourne", keywords: ["Tullamarine"] },
  { iata: "BNE", icao: "YBBN", name: "Brisbane Airport", city: "Brisbane", country: "Australia", latitude: -27.3842, longitude: 153.1175, timezone: "Australia/Brisbane" },
  { iata: "PER", icao: "YPPH", name: "Perth Airport", city: "Perth", country: "Australia", latitude: -31.9403, longitude: 115.9672, timezone: "Australia/Perth" },
  { iata: "AKL", icao: "NZAA", name: "Auckland Airport", city: "Auckland", country: "New Zealand", latitude: -37.0082, longitude: 174.785, timezone: "Pacific/Auckland" },
  { iata: "CHC", icao: "NZCH", name: "Christchurch Airport", city: "Christchurch", country: "New Zealand", latitude: -43.4894, longitude: 172.5322, timezone: "Pacific/Auckland" },
] as const satisfies readonly Airport[];

export const DEFAULT_AIRPORT: Airport = AIRPORTS.find((airport) => airport.iata === "BKK") ?? AIRPORTS[0];

const normalize = (value: string): string =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toUpperCase();

/** O(1) exact lookup by either IATA or ICAO code. */
export const AIRPORT_BY_CODE: ReadonlyMap<string, Airport> = new Map(
  AIRPORTS.flatMap((airport) => [
    [airport.iata, airport] as const,
    [airport.icao, airport] as const,
  ]),
);

/** Resolve an exact IATA/ICAO code. Whitespace and case are ignored. */
export function findAirport(code: string | null | undefined): Airport | undefined {
  return code ? AIRPORT_BY_CODE.get(normalize(code)) : undefined;
}

export const getAirportByCode = findAirport;

/**
 * Search airport codes, cities, names, countries, and common aliases.
 * Exact code matches are always first, followed by code prefixes and then text
 * matches. The stable final ordering prevents a flickering search overlay.
 */
export function searchAirports(query: string, limit = 8): Airport[] {
  const needle = normalize(query);
  const safeLimit = Math.max(0, Math.floor(limit));
  if (safeLimit === 0) return [];
  if (!needle) return AIRPORTS.slice(0, safeLimit);

  const score = (airport: Airport): number => {
    if (airport.iata === needle) return 1_000;
    if (airport.icao === needle) return 990;
    if (airport.iata.startsWith(needle)) return 900 - airport.iata.length;
    if (airport.icao.startsWith(needle)) return 880 - airport.icao.length;

    const city = normalize(airport.city);
    const name = normalize(airport.name);
    const country = normalize(airport.country);
    const keywords = (airport.keywords ?? []).map(normalize);

    if (city === needle) return 800;
    if (city.startsWith(needle)) return 760;
    if (name.startsWith(needle)) return 720;
    if (keywords.some((keyword) => keyword.startsWith(needle))) return 700;
    if (city.includes(needle)) return 620;
    if (name.includes(needle)) return 600;
    if (keywords.some((keyword) => keyword.includes(needle))) return 580;
    if (country.startsWith(needle)) return 500;
    if (country.includes(needle)) return 480;
    return -1;
  };

  return AIRPORTS.map((airport, index) => ({ airport, index, score: score(airport) }))
    .filter((result) => result.score >= 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, safeLimit)
    .map(({ airport }) => airport);
}

