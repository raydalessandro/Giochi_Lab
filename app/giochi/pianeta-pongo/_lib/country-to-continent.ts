import type { ContinentId } from '../_data/continents';

// Mappa il nome inglese del paese (come appare in world-atlas/countries-110m.json)
// al nostro ContinentId. Russia → Asia per scelta cartografica (gran parte del territorio).
// Turkey → Asia. Le isole transcontinentali finiscono dove ha senso geograficamente.

export const COUNTRY_TO_CONTINENT: Record<string, ContinentId> = {
  // === AFRICA (51) ===
  Algeria: 'africa', Angola: 'africa', Benin: 'africa', Botswana: 'africa',
  'Burkina Faso': 'africa', Burundi: 'africa', Cameroon: 'africa',
  'Central African Rep.': 'africa', Chad: 'africa', Congo: 'africa',
  "Côte d'Ivoire": 'africa', 'Dem. Rep. Congo': 'africa', Djibouti: 'africa',
  Egypt: 'africa', 'Eq. Guinea': 'africa', Eritrea: 'africa', eSwatini: 'africa',
  Ethiopia: 'africa', Gabon: 'africa', Gambia: 'africa', Ghana: 'africa',
  Guinea: 'africa', 'Guinea-Bissau': 'africa', Kenya: 'africa', Lesotho: 'africa',
  Liberia: 'africa', Libya: 'africa', Madagascar: 'africa', Malawi: 'africa',
  Mali: 'africa', Mauritania: 'africa', Morocco: 'africa', Mozambique: 'africa',
  Namibia: 'africa', Niger: 'africa', Nigeria: 'africa', Rwanda: 'africa',
  'S. Sudan': 'africa', Senegal: 'africa', 'Sierra Leone': 'africa',
  Somalia: 'africa', Somaliland: 'africa', 'South Africa': 'africa',
  Sudan: 'africa', Tanzania: 'africa', Togo: 'africa', Tunisia: 'africa',
  Uganda: 'africa', 'W. Sahara': 'africa', Zambia: 'africa', Zimbabwe: 'africa',

  // === ASIA (48) ===
  Afghanistan: 'asia', Armenia: 'asia', Azerbaijan: 'asia', Bangladesh: 'asia',
  Bhutan: 'asia', Brunei: 'asia', Cambodia: 'asia', China: 'asia', Cyprus: 'asia',
  Georgia: 'asia', India: 'asia', Indonesia: 'asia', Iran: 'asia', Iraq: 'asia',
  Israel: 'asia', Japan: 'asia', Jordan: 'asia', Kazakhstan: 'asia',
  Kuwait: 'asia', Kyrgyzstan: 'asia', Laos: 'asia', Lebanon: 'asia',
  Malaysia: 'asia', Mongolia: 'asia', Myanmar: 'asia', 'N. Cyprus': 'asia',
  Nepal: 'asia', 'North Korea': 'asia', Oman: 'asia', Pakistan: 'asia',
  Palestine: 'asia', Philippines: 'asia', Qatar: 'asia', Russia: 'asia',
  'Saudi Arabia': 'asia', 'South Korea': 'asia', 'Sri Lanka': 'asia',
  Syria: 'asia', Taiwan: 'asia', Tajikistan: 'asia', Thailand: 'asia',
  'Timor-Leste': 'asia', Turkey: 'asia', Turkmenistan: 'asia',
  'United Arab Emirates': 'asia', Uzbekistan: 'asia', Vietnam: 'asia', Yemen: 'asia',

  // === EUROPA (38) ===
  Albania: 'europa', Austria: 'europa', Belarus: 'europa', Belgium: 'europa',
  'Bosnia and Herz.': 'europa', Bulgaria: 'europa', Croatia: 'europa',
  Czechia: 'europa', Denmark: 'europa', Estonia: 'europa', Finland: 'europa',
  France: 'europa', Germany: 'europa', Greece: 'europa', Hungary: 'europa',
  Iceland: 'europa', Ireland: 'europa', Italy: 'europa', Kosovo: 'europa',
  Latvia: 'europa', Lithuania: 'europa', Luxembourg: 'europa', Macedonia: 'europa',
  Moldova: 'europa', Montenegro: 'europa', Netherlands: 'europa', Norway: 'europa',
  Poland: 'europa', Portugal: 'europa', Romania: 'europa', Serbia: 'europa',
  Slovakia: 'europa', Slovenia: 'europa', Spain: 'europa', Sweden: 'europa',
  Switzerland: 'europa', Ukraine: 'europa', 'United Kingdom': 'europa',

  // === NORD AMERICA (18) ===
  Bahamas: 'americhe_nord', Belize: 'americhe_nord', Canada: 'americhe_nord',
  'Costa Rica': 'americhe_nord', Cuba: 'americhe_nord',
  'Dominican Rep.': 'americhe_nord', 'El Salvador': 'americhe_nord',
  Greenland: 'americhe_nord', Guatemala: 'americhe_nord', Haiti: 'americhe_nord',
  Honduras: 'americhe_nord', Jamaica: 'americhe_nord', Mexico: 'americhe_nord',
  Nicaragua: 'americhe_nord', Panama: 'americhe_nord',
  'Puerto Rico': 'americhe_nord', 'Trinidad and Tobago': 'americhe_nord',
  'United States of America': 'americhe_nord',

  // === SUD AMERICA (13) ===
  Argentina: 'americhe_sud', Bolivia: 'americhe_sud', Brazil: 'americhe_sud',
  Chile: 'americhe_sud', Colombia: 'americhe_sud', Ecuador: 'americhe_sud',
  'Falkland Is.': 'americhe_sud', Guyana: 'americhe_sud',
  Paraguay: 'americhe_sud', Peru: 'americhe_sud', Suriname: 'americhe_sud',
  Uruguay: 'americhe_sud', Venezuela: 'americhe_sud',

  // === OCEANIA (7) ===
  Australia: 'oceania', Fiji: 'oceania', 'New Caledonia': 'oceania',
  'New Zealand': 'oceania', 'Papua New Guinea': 'oceania',
  'Solomon Is.': 'oceania', Vanuatu: 'oceania',

  // === ANTARTIDE (2) ===
  Antarctica: 'antartide', 'Fr. S. Antarctic Lands': 'antartide',
};

export function continentOf(countryName: string): ContinentId | null {
  return COUNTRY_TO_CONTINENT[countryName] ?? null;
}
