export const parseUserDetails = (inputString) => {
  const details = {
    name: "",
    role: "",
    skills: "",
    documentPath: ""
  };

  // Regex patterns for extracting information
  const nameMatch = inputString.match(/(?:name|named)\s+([A-Za-z]+)/i);
  const roleMatch = inputString.match(
    /(?:as|work as|role of)\s+([A-Za-z\s]+)/i
  );
  const skillsMatch = inputString.match(
    /(?:in|with skills in)\s+([A-Za-z\s]+)/i
  );
  const documentMatch = inputString.match(
    /(?:document path|file path)\s+([\S]+)/i
  );

  // Assign extracted values to the object
  if (nameMatch) details.name = nameMatch[1].trim();
  if (roleMatch) details.role = roleMatch[1].trim();
  if (skillsMatch) details.skills = skillsMatch[1].trim();
  if (documentMatch) details.documentPath = documentMatch[1].trim();

  return details;
};

export const formatMessage = (text) => {
  if (!text) return "";

  // Remove "TERMINATE" if present at the end
  text = text.replace(/\s*TERMINATE$/, "");

  // Convert markdown-style links to HTML <a> tags
  const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g;
  const formattedText = text.split(linkRegex).map((part, index) => {
    if (index % 3 === 1) {
      // This is the link text
      return (
        <a
          key={index}
          href={text.split(linkRegex)[index + 1]}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: "#1976d2",
            textDecoration: "none",
            fontWeight: "bold"
          }}
        >
          {part}
        </a>
      );
    }
    return part;
  });

  return formattedText;
};
