export function ReplaceUnderScoreMakeCamelCase(input:string) {
    return input
      .split("_").slice(1).join("_")
      .replace(/_/g, ' ') // Replace underscores with spaces
      .replace(/\b\w/g, char => char.toUpperCase())
      ; // Capitalize the first letter of each word     
  }
  export function getDisasterType(code: string) {
    switch (code) {
      case 'EQ': return 'Earthquake';
      case 'TC': return 'Tropical Cyclone';
      case 'FL': return 'Flood';
      case 'DR': return 'Drought';
      case 'VO': return 'Volcano';
      case 'WF': return 'Wildfire';
      case 'TS': return 'Tsunami';
      case 'EH': return 'Extra Tropical Cyclone';
      case 'LS': return 'Landslide';
      case 'SW': return 'Severe Weather';
      case 'HU': return 'Humanitarian Crisis';
      case 'ST': return 'Storm Surge';
      default: return 'Unknown Disaster Type';
    }
  }
  