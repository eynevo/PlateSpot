export const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado',
  'Connecticut', 'Delaware', 'District of Columbia', 'Florida', 'Georgia',
  'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky',
  'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota',
  'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
  'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota',
  'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island',
  'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
  'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming',
]

export const CA_PROVINCES = [
  'Alberta', 'British Columbia', 'Manitoba', 'New Brunswick',
  'Newfoundland and Labrador', 'Northwest Territories', 'Nova Scotia',
  'Nunavut', 'Ontario', 'Prince Edward Island', 'Quebec', 'Saskatchewan',
  'Yukon',
]

export const MX_STATES = [
  'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche',
  'Chiapas', 'Chihuahua', 'Ciudad de Mexico', 'Coahuila', 'Colima',
  'Durango', 'Guanajuato', 'Guerrero', 'Hidalgo', 'Jalisco',
  'Mexico State', 'Michoacan', 'Morelos', 'Nayarit', 'Nuevo Leon',
  'Oaxaca', 'Puebla', 'Queretaro', 'Quintana Roo', 'San Luis Potosi',
  'Sinaloa', 'Sonora', 'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz',
  'Yucatan', 'Zacatecas',
]

export const REGIONS = [
  { label: 'United States', items: US_STATES, flag: '🇺🇸', code: 'US' },
  { label: 'Canada', items: CA_PROVINCES, flag: '🇨🇦', code: 'CA' },
  { label: 'Mexico', items: MX_STATES, flag: '🇲🇽', code: 'MX' },
]

export const ALL_ITEMS = REGIONS.flatMap(r =>
  r.items.map(name => ({ name, country: r.code, flag: r.flag }))
)

export function getCountryForRegion(name) {
  for (const r of REGIONS) {
    if (r.items.includes(name)) return r.code
  }
  return null
}

export function getRegionCounts() {
  return {
    US: US_STATES.length,
    CA: CA_PROVINCES.length,
    MX: MX_STATES.length,
    total: US_STATES.length + CA_PROVINCES.length + MX_STATES.length,
  }
}
