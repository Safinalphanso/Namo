export const copyToClipboard = async (text: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(text);
        console.log("Copied to clipboard!");
      } catch (err) {
        console.error("Clipboard API failed, trying fallback...", err);
        fallbackCopy(text);
      }
    } else {
      console.warn("Clipboard API not supported. Using fallback.");
      fallbackCopy(text);
    }
  };
  
  // Fallback for older browsers
  const fallbackCopy = (text: string) => {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed"; // Prevents scrolling to bottom
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
  
    try {
      const successful = document.execCommand("copy");
      if (successful) {
        console.log("Fallback: Copied to clipboard!");
      } else {
        console.warn("Fallback: Copy command failed.");
      }
    } catch (err) {
      console.error("Fallback: Unable to copy", err);
    }
  
    document.body.removeChild(textarea);
  };
  