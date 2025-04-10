export function ReplaceUnderScoreMakeCamelCase(input:string) {
    return input
      .split("_").slice(1).join("_")
      .replace(/_/g, ' ') // Replace underscores with spaces
      .replace(/\b\w/g, char => char.toUpperCase())
      ; // Capitalize the first letter of each word     
  }
  