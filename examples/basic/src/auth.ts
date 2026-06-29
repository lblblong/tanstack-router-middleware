let loggedIn = false

export function isLoggedIn() {
  return loggedIn
}

export function setLoggedIn(value: boolean) {
  loggedIn = value
}

export function login() {
  loggedIn = true
}

export function logout() {
  loggedIn = false
}
