const US_STATES = [
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

const CA_PROVINCES = [
  'Alberta', 'British Columbia', 'Manitoba', 'New Brunswick',
  'Newfoundland and Labrador', 'Northwest Territories', 'Nova Scotia',
  'Nunavut', 'Ontario', 'Prince Edward Island', 'Quebec', 'Saskatchewan',
  'Yukon',
]

const MX_STATES = [
  'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche',
  'Chiapas', 'Chihuahua', 'Ciudad de Mexico', 'Coahuila', 'Colima',
  'Durango', 'Guanajuato', 'Guerrero', 'Hidalgo', 'Jalisco',
  'Mexico State', 'Michoacan', 'Morelos', 'Nayarit', 'Nuevo Leon',
  'Oaxaca', 'Puebla', 'Queretaro', 'Quintana Roo', 'San Luis Potosi',
  'Sinaloa', 'Sonora', 'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz',
  'Yucatan', 'Zacatecas',
]

const REGIONS = [
  { label: 'United States', items: US_STATES, code: 'US' },
  { label: 'Canada', items: CA_PROVINCES, code: 'CA' },
  { label: 'Mexico', items: MX_STATES, code: 'MX' },
]

export function getCountryForRegion(name) {
  for (const r of REGIONS) {
    if (r.items.includes(name)) return r.code
  }
  return null
}

export function findState(input) {
  const lower = input.trim().toLowerCase()
  for (const r of REGIONS) {
    for (const name of r.items) {
      if (name.toLowerCase() === lower) return { name, country: r.code }
    }
  }
  return null
}
