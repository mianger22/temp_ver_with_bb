import { reloadAuthorized } from './Authorized';

// use localStorage to store the authority info, which might be sent from server in actual project.
export function getAuthority(str?: string): string | string[] {
  const authorityString =
    typeof str === 'undefined' && localStorage ? localStorage.getItem('antd-pro-authority') : str;
  // authorityString could be admin, "admin", ["admin"]
  let authority;
  try {
    if (authorityString) {
      authority = JSON.parse(authorityString);
    }
  } catch (e) {
    authority = authorityString;
  }
  if (typeof authority === 'string') {
    return [authority];
  }
  // preview.pro.ant.design only do not use in your production.
  // preview.pro.ant.design Dedicated environment variable, please do not use it in your project.
  if (!authority && ANT_DESIGN_PRO_ONLY_DO_NOT_USE_IN_YOUR_PRODUCTION === 'site') {
    return ['admin'];
  }
  return authority;
}

export function setAuthority(authority: string | string[] | null): void {
  if (authority == null) {
    localStorage.removeItem("antd-pro-authority");
  } else {
    const proAuthority = typeof authority === 'string' ? [authority] : authority;
    localStorage.setItem('antd-pro-authority', JSON.stringify(proAuthority));
  }
  // auto reload
  reloadAuthorized();
}
export function setToken(token: string | null): void {
  if (token == null) {
    localStorage.removeItem("user-token")
  } else {
    localStorage.setItem('user-token', token);
  }
}

export function getToken(): string | null {
  return localStorage.getItem("user-token")
}
