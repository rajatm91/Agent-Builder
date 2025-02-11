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


  const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g;
  const formattedText = [];
  let lastIndex = 0;

  text.replace(linkRegex, (match, linkText, url, index) => {
    formattedText.push(text.substring(lastIndex, index));

    formattedText.push(
      <a
        key={index}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          color: "#1976d2",
          textDecoration: "underline",
          fontWeight: "bold",
          cursor: "pointer",
        }}
      >
        {linkText}
      </a>
    );

    lastIndex = index + match.length;
    return match;
  });

  formattedText.push(text.substring(lastIndex));

  return formattedText;
};
