export function parseCsv(csv: string) {
  // Split rows and handle potential carriage returns
  const rows = csv.split(/\r?\n/).filter((row) => row.trim());
  const headers = rows[0].split(",").map((header) => header.trim());

  const data = rows.slice(1).map((row) => {
    // Handle quoted fields that might contain commas
    const values: string[] = [];
    let currentValue = "";
    let insideQuotes = false;

    for (let i = 0; i < row.length; i++) {
      const char = row[i];
      if (char === '"') {
        if (insideQuotes && row[i + 1] === '"') {
          // Handle escaped quotes
          currentValue += '"';
          i++; // Skip next quote
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if (char === "," && !insideQuotes) {
        values.push(currentValue.trim());
        currentValue = "";
      } else {
        currentValue += char;
      }
    }
    values.push(currentValue.trim());

    return headers.reduce((obj, header, index) => {
      let value = values[index]?.trim() || "";

      // Clean up the value
      value = value
        .replace(/^"+|"+$/g, "") // Remove surrounding quotes
        .replace(/""/g, '"') // Replace double quotes with single quotes
        .trim();

      // Special handling for Patient ID - remove .0
      if (header === "Patient ID" && value.endsWith(".0")) {
        value = value.slice(0, -2);
      }

      obj[header] = value;
      return obj;
    }, {} as Record<string, string>);
  });

  return data;
}

export function formatCsv(data: Record<string, string>[]) {
  const headers = Object.keys(data[0]);
  const rows = data.map((row) => {
    return headers.map((header) => row[header]).join(",");
  });
  return [headers.join(","), ...rows].join("\n");
}

export function downloadCsv(data: Record<string, string>[]) {
  const csv = formatCsv(data);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  return url;
}
