export enum PermissionsModule {
  USERS = 'user',
  ROLES = 'role',
}

export enum PermissionsAction {
  VIEW = 'view',
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
}

export enum PermissionsType {
  USER_VIEW = `${PermissionsModule.USERS}:${PermissionsAction.VIEW}`,
  USER_CREATE = `${PermissionsModule.USERS}:${PermissionsAction.CREATE}`,
  USER_UPDATE = `${PermissionsModule.USERS}:${PermissionsAction.UPDATE}`,
  USER_DELETE = `${PermissionsModule.USERS}:${PermissionsAction.DELETE}`,

  ROLE_VIEW = `${PermissionsModule.ROLES}:${PermissionsAction.VIEW}`,
  ROLE_CREATE = `${PermissionsModule.ROLES}:${PermissionsAction.CREATE}`,
  ROLE_UPDATE = `${PermissionsModule.ROLES}:${PermissionsAction.UPDATE}`,
  ROLE_DELETE = `${PermissionsModule.ROLES}:${PermissionsAction.DELETE}`,
}
