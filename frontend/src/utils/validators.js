export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

export function validatePassword(password) {
  if (!password) return 'Password is required'
  if (password.length < 8) return 'Password must be at least 8 characters'
  return null
}

export function validateRequired(value, fieldName = 'Field') {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return `${fieldName} is required`
  }
  return null
}

export function validatePasswordMatch(password, confirmPassword) {
  if (password !== confirmPassword) {
    return 'Passwords do not match'
  }
  return null
}

export function validatePhone(phone) {
  if (!phone) return null // optional field
  const re = /^[+]?[\d\s\-().]{7,15}$/
  if (!re.test(phone)) return 'Invalid phone number format'
  return null
}

export function validateFileType(file, allowedTypes = ['.pdf', '.docx']) {
  if (!file) return 'Please select a file'
  const name = file.name.toLowerCase()
  const isAllowed = allowedTypes.some(ext => name.endsWith(ext))
  if (!isAllowed) {
    return `Only ${allowedTypes.join(', ')} files are allowed`
  }
  return null
}

export function validateFileSize(file, maxMB = 10) {
  if (!file) return null
  const maxBytes = maxMB * 1024 * 1024
  if (file.size > maxBytes) {
    return `File size must be less than ${maxMB}MB`
  }
  return null
}

export function validateLoginForm(email, password) {
  const errors = {}
  if (!email) errors.email = 'Email is required'
  else if (!validateEmail(email)) errors.email = 'Invalid email address'
  if (!password) errors.password = 'Password is required'
  return errors
}
