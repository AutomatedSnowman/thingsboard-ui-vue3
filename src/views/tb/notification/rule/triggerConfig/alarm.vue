<template>
  <div class="trigger-config-alarm">
    <BasicForm @register="registerForm">
    </BasicForm>
  </div>
</template>
<script lang="ts" setup name="TriggerConfigAlarm">
import { isArray, isEmpty } from 'lodash';
import type { NamePath } from 'ant-design-vue/lib/form/interface';
import { BasicForm, FormSchema, useForm } from '/@/components/Form';
import { NotificationType } from '/@/enums/notificationEnum';
import { useI18n } from '/@/hooks/web/useI18n';
import { ALARM_SEVERITY_OPTIONS, ALARM_STATUS_OPTIONS } from '/@/enums/alarmEnum';
const { t } = useI18n('tb');

const notifyOnOptions = [
  { value: 'CREATED', label: 'Created' },
  { value: 'SEVERITY_CHANGED', label: 'Severity Changed' },
  { value: 'ACKNOWLEDGED', label: 'Acknowledged' },
  { value: 'CLEARED', label: 'Cleared' },
];



const inputFormSchemas: FormSchema[] = [
  { field: 'triggerConfig.triggerType', component: 'Input', defaultValue: NotificationType.ALARM, show: false },
  {
    label: t('Alarm Type'),
    subLabel: t('No Level Selected'),
    field: 'triggerConfig.alarmTypes',
    component: 'Select',
    componentProps: {
      options: [],
      mode: 'tags',
      open: false,
      placeholder: 'Any Alarm Type'
    },
    colProps: { lg: 24, md: 24 },
  },
  {
    label: t('Alarm Level'),
    subLabel: t('No Level Selected'),
    field: 'triggerConfig.alarmSeverities',
    component: 'Select',
    componentProps: {
      mode: 'multiple',
      options: ALARM_SEVERITY_OPTIONS,
      placeholder: 'Any Alarm Level'
    },
    colProps: { lg: 24, md: 24 },
  },
  {
    label: t('Alarm Notification'),
    field: 'triggerConfig.notifyOn',
    component: 'Select',
    defaultValue: ['CREATED'],
    componentProps: {
      mode: 'multiple',
      options: notifyOnOptions,
    },
    required: true,
    colProps: { lg: 24, md: 24 },
  },
  {
    label: t('Stop Notifications'),
    subLabel: t('No State Selected'),
    field: 'triggerConfig.alarmStatuses',
    component: 'Select',
    componentProps: {
      mode: 'multiple',
      options: ALARM_STATUS_OPTIONS,
    },
    colProps: { lg: 24, md: 24 },
  },

  {
    label: t('Description'),
    field: 'additionalConfig.description',
    component: 'InputTextArea',
    componentProps: {
      maxlength: 500,
    },
    colProps: { lg: 24, md: 24 },
  },
]

const [registerForm, { resetFields, setFieldsValue, updateSchema, getFieldsValue, validate }] = useForm({
  layout: 'vertical',
  schemas: inputFormSchemas,
  baseColProps: { lg: 12, md: 24 },
});
async function setTriggerFieldsValue(values: any) {
  await resetFields();
  await setFieldsValue(values);
}

async function validateTrigger(nameList?: NamePath[]) {
  let data = await validate(nameList);
  if (!isEmpty(data.triggerConfig.alarmTypes) && !isArray(data.triggerConfig.alarmTypes)) {
    data.triggerConfig.alarmTypes = data.triggerConfig.alarmTypes.split(',');
  }
  if (!isEmpty(data.triggerConfig.alarmSeverities) && !isArray(data.triggerConfig.alarmSeverities)) {
    data.triggerConfig.alarmSeverities = data.triggerConfig.alarmSeverities.split(',');
  }
  if (!isEmpty(data.triggerConfig.alarmStatuses) && !isArray(data.triggerConfig.alarmStatuses)) {
    data.triggerConfig.alarmStatuses = data.triggerConfig.alarmStatuses.split(',');
  }
  if (!isEmpty(data.triggerConfig.notifyOn) && !isArray(data.triggerConfig.notifyOn)) {
    data.triggerConfig.notifyOn = data.triggerConfig.notifyOn.split(',');
  }

  return data
}

defineExpose({ getFieldsValue, validate: validateTrigger, resetFields, setFieldsValue: setTriggerFieldsValue })

</script>
<style lang="less">
.trigger-config-alarm {}
</style>
