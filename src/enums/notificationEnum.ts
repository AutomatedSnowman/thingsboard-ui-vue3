export enum NotificationType {
  GENERAL = 'GENERAL',
  ALARM = 'ALARM',
  DEVICE_ACTIVITY = 'DEVICE_ACTIVITY',
  ENTITY_ACTION = 'ENTITY_ACTION',
  ALARM_COMMENT = 'ALARM_COMMENT',
  RULE_ENGINE_COMPONENT_LIFECYCLE_EVENT = 'RULE_ENGINE_COMPONENT_LIFECYCLE_EVENT',
  ALARM_ASSIGNMENT = 'ALARM_ASSIGNMENT',
  NEW_PLATFORM_VERSION = 'NEW_PLATFORM_VERSION',
  ENTITIES_LIMIT = 'ENTITIES_LIMIT',
  API_USAGE_LIMIT = 'API_USAGE_LIMIT',
  RULE_NODE = 'RULE_NODE',
  RATE_LIMITS = 'RATE_LIMITS',
  EDGE_CONNECTION = 'EDGE_CONNECTION',
  EDGE_COMMUNICATION_FAILURE = 'EDGE_COMMUNICATION_FAILURE',
  TASK_PROCESSING_FAILURE = 'TASK_PROCESSING_FAILURE',
}
export const NOTIFICATION_TYPE_OPTIONS = [
  { value: NotificationType.GENERAL, label: 'General' },
  { value: NotificationType.ALARM, label: 'Alarm' },
  { value: NotificationType.DEVICE_ACTIVITY, label: 'Device Activity' },
  { value: NotificationType.ENTITY_ACTION, label: 'Entity Action' },
  { value: NotificationType.ALARM_COMMENT, label: 'Alarm Comment' },
  { value: NotificationType.RULE_ENGINE_COMPONENT_LIFECYCLE_EVENT, label: 'Rule Engine Life Cycle Event' },
  { value: NotificationType.ALARM_ASSIGNMENT, label: 'Alarm Assignment' },
  { value: NotificationType.NEW_PLATFORM_VERSION, label: 'New Platform Version' },
  { value: NotificationType.ENTITIES_LIMIT, label: 'Entity Limit' },
  { value: NotificationType.API_USAGE_LIMIT, label: 'API Usage Limit' },
  { value: NotificationType.RULE_NODE, label: 'Rule Node' },
  { value: NotificationType.RATE_LIMITS, label: 'Rate Limit Exceeded' },
  { value: NotificationType.EDGE_CONNECTION, label: 'Edge Connection' },
  { value: NotificationType.EDGE_COMMUNICATION_FAILURE, label: 'Edge Connection Failed' },
  { value: NotificationType.TASK_PROCESSING_FAILURE, label: 'Task Processing Failed' },
];

export enum NotificationStatus {
  SENT = 'SENT',
  READ = 'READ',
}
export enum NotificationRequestStatus {
  PROCESSING = 'PROCESSING',
  SENT = 'SENT',
  SCHEDULED = 'SCHEDULED',
}

export const NOTIFICATION_REQUEST_STATUS_OPTIONS = [
  { value: NotificationRequestStatus.PROCESSING, label: 'Processing' },
  { value: NotificationRequestStatus.SENT, label: 'Sent' },
  { value: NotificationRequestStatus.SCHEDULED, label: 'Scheduled' },
];

export enum NotificationRecipientType {
  PLATFORM_USERS = 'PLATFORM_USERS',
  SLACK = 'SLACK',
}

export const NOTIFICATION_RECIPIENT_TYPE_OPTIONS = [
  { value: NotificationRecipientType.PLATFORM_USERS, label: 'Platform User' },
  { value: NotificationRecipientType.SLACK, label: 'Slack User' },
];

export enum NotificationRecipientUsersFilter {
  ALL_USERS = 'ALL_USERS',
  USER_LIST = 'USER_LIST',
  AFFECTED_USER = 'AFFECTED_USER',
  CUSTOMER_USERS = 'CUSTOMER_USERS',
  TENANT_ADMINISTRATORS = 'TENANT_ADMINISTRATORS',
  SYSTEM_ADMINISTRATORS = 'SYSTEM_ADMINISTRATORS',
  AFFECTED_TENANT_ADMINISTRATORS = 'AFFECTED_TENANT_ADMINISTRATORS',
  ORIGINATOR_ENTITY_OWNER_USERS = 'ORIGINATOR_ENTITY_OWNER_USERS',
}

export const NOTIFICATION_RECIPIENT_USER_FILTER_OPTIONS = [
  { value: NotificationRecipientUsersFilter.ALL_USERS, label: 'All Users' },
  { value: NotificationRecipientUsersFilter.USER_LIST, label: 'User List' },
  { value: NotificationRecipientUsersFilter.CUSTOMER_USERS, label: 'Customer Users' },
  { value: NotificationRecipientUsersFilter.TENANT_ADMINISTRATORS, label: 'Tenant Admins' },
  { value: NotificationRecipientUsersFilter.SYSTEM_ADMINISTRATORS, label: 'System Admins' },
  { value: NotificationRecipientUsersFilter.AFFECTED_USER, label: 'Affected User' },
  {
    value: NotificationRecipientUsersFilter.AFFECTED_TENANT_ADMINISTRATORS,
    label: 'Affected Tenant Admin',
  },
  { value: NotificationRecipientUsersFilter.ORIGINATOR_ENTITY_OWNER_USERS, label: 'User Entity Owner' },
];
