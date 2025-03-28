import L from 'leaflet'


// Function to create a custom SVG icon from Iconify
export const createIconifyIcon = (iconName:number, size = 24, color = 'white') => {
    const iconUrl = `https://api.iconify.design/${iconName}.svg?height=${size}&color=${encodeURIComponent(color)}`;
    
    return L.divIcon({
      html: `<img src="${iconUrl}" alt="${iconName} icon" style="width: ${size}px; height: ${size}px;" />`,
      className: 'iconify-marker-icon', // Optional: for custom styling
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2]
    });
  };


export function getIconUrl(iconName:string, size = 32, color = 'black') {
    // Construct Iconify SVG URL
    const baseUrl = 'https://api.iconify.design/';
    const encodedColor = encodeURIComponent(color);
    
    // Create URL with size and color parameters
    const iconUrl = `${baseUrl}${iconName}.svg?height=${size}&color=${encodedColor}`;
    
    return {
      url: iconUrl,
      name: iconName
    };
  }
  
  
export function CreateMarker(URL:string){
    return  L.icon({
            iconUrl: URL, // Place an icon in the public/icons/ folder
            iconSize: [32, 32], // Adjust size as needed
            iconAnchor: [16, 32], // Center the icon properly
            popupAnchor: [0, -32],
          });
}