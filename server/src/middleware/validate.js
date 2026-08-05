export default function validate(rules) {
  return (req, res, next) => {
    const errors = [];
    for (const [field, rule] of Object.entries(rules)) {
      const value = req.body[field];
      if (rule.required && !value) errors.push(`${field} is required.`);
      if (rule.minLength && typeof value === "string" && value.trim().length < rule.minLength) errors.push(`${field} must be at least ${rule.minLength} characters.`);
      if (rule.enum && value && !rule.enum.includes(value)) errors.push(`${field} must be one of: ${rule.enum.join(", ")}.`);
      if (rule.custom && !rule.custom(value, req)) errors.push(rule.customMessage || `${field} is invalid.`);
    }
    if (errors.length) return res.status(400).json({ message: errors.join(" ") });
    next();
  };
}
