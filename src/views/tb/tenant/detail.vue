<template>
  <BasicDrawer v-bind="$attrs" :showFooter="false" @register="registerDrawer" width="60%"
    :rootClassName="'tb-detail-wrapper'">
    <template #title>
      <div class="flex flex-row items-center">
        <Icon :icon="getTitle.icon" class="pr-3 m-1 tb-detail-title-icon" />
        <div class="flex flex-col">
          <span class="text-lg font-bold">{{ getTitle.value || '· · · ·' }}</span>
          <span class="text-sm">Tenant Details</span>
        </div>
      </div>
    </template>
    <Tabs v-model:activeKey="tabActiveKey" class="tb-detail-menu">
      <TabPane key="DETAIL">
        <template #tab> <span>
            <Icon :icon="'ant-design:appstore-outlined'" /> 详情
          </span> </template>
        <div class="space-x-4">
          <a-button type="primary" @click="handleTenantAdmin">
            <Icon :icon="'ant-design:team-outlined'" />Tenant Admin
          </a-button>
          <a-button type="primary success" @click="handleEditTenant">
            <Icon :icon="'i-clarity:note-edit-line'" />Edit Tenant Admin
          </a-button>
          <a-button type="primary" danger @click="handleDeleteTenant">
            <Icon :icon="'ant-design:delete-outlined'" />Delete Tenant Admin
          </a-button>
        </div>
        <div class="space-x-4  my-4">
          <a-button @click="handleCopyTenantId">
            <Icon :icon="'ant-design:copy-filled'" />
            Copy Tenant ID
          </a-button>
        </div>
        <Description @register="register" size="default">
          <template #state="{ data }">
            {{ areaList.province_list[data.state] }}/
            {{ areaList.city_list[data.city] }}/
            {{ areaList.county_list[data.country] }}
          </template>
        </Description>
      </TabPane>
      <TabPane key="TELEMETRY">
        <template #tab><span>
            <Icon :icon="'ant-design:line-chart-outlined'" /> Data
          </span> </template>
        <Telemetry v-if="tabActiveKey == 'TELEMETRY'"  :entityType="EntityType.TENANT" :entityId="record?.id?.id" />
      </TabPane>
      <TabPane key="ALARM">
        <template #tab><span>
            <Icon :icon="'ant-design:alert-outlined'" /> Alarm
          </span> </template>
        <Alarm :entityType="EntityType.TENANT" :entityId="record?.id?.id" />
      </TabPane>
      <TabPane key="EVENT">
        <template #tab><span>
            <Icon :icon="'ant-design:info-circle-outlined'" /> Event
          </span> </template>
        <Event :entityType="EntityType.TENANT" :entityId="record?.id?.id" />
      </TabPane>
      <TabPane key="RELATION">
        <template #tab><span>
            <Icon :icon="'ant-design:radar-chart-outlined'" /> Relation
          </span> </template>
        <Relation :entityType="EntityType.TENANT" :entityId="record?.id?.id" />
      </TabPane>
    </Tabs>
  </BasicDrawer>
</template>
<script lang="ts" setup name="ViewsTbTenantDetail">
import { ref, unref, computed } from 'vue';
import { useI18n } from '/@/hooks/web/useI18n';
import { useMessage } from '/@/hooks/web/useMessage';
import { router } from '/@/router';
import { copyToClipboard } from '/@/utils';
import { Icon } from '/@/components/Icon';
import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
import { TenantInfo, tenantInfoById } from '/@/api/tb/tenant';
import { areaList } from '@vant/area-data';
import { Tabs, TabPane } from 'ant-design-vue';
import { DescItem, Description, useDescription } from '/@/components/Description';
import Telemetry from '/@/views/tb/telemetry/index.vue';
import Alarm from '/@/views/tb/alarm/list.vue';
import Relation from '/@/views/tb/relation/list.vue';
import Event from '/@/views/tb/event/index.vue';

import { EntityType } from '/@/enums/entityTypeEnum';


const emit = defineEmits(['edit', 'delete', 'admin', 'register',]);

const { t } = useI18n('tb');
const { showMessage } = useMessage();
const { meta } = unref(router.currentRoute);
const record = ref<TenantInfo>({} as TenantInfo);

const getTitle = computed(() => ({
  icon: meta.icon || 'ant-design:book-outlined',
  value: record.value.title,
}));

const tabActiveKey = ref('DETAIL');

const descSchema: DescItem[] = [
  {
    label: t('Tenant Name'),
    field: 'title',
    span: 4,
  },
  {
    label: t('Tenant Configuration'),
    field: 'tenantProfileName',
    span: 2,

  },
  {
    label: t('Phone Number'),
    field: 'phone',
    span: 2,
  },
  {
    label: t('Zip Code'),
    field: 'zip',
    span: 2,

  },
  {
    label: t('Email Address'),
    field: 'email',
    span: 2,

  },
  {
    label: t('City, State, Country'),
    field: 'state',
    span: 4,
    slot: 'state',
  },

  {
    label: t('Address'),
    field: 'address',
    span: 4,
  },
  {
    label: t('Alternate Address'),
    field: 'address2',
    span: 4,
  },

  {
    label: t('Additional Information'),
    field: 'additionalInfo.description',
    span: 4,
  },
];
const [register, { setDescProps }] = useDescription({
  schema: descSchema,
})



const [registerDrawer, { setDrawerProps, closeDrawer }] = useDrawerInner(async (data) => {
  try {
    setDrawerProps({ loading: true });
    await clear();
    record.value = await tenantInfoById(data.id.id);
    setDescProps({ data: record.value });
  } catch (error: any) {
    if (error.message) {
      showMessage(error.message, 'error')
    }
    console.log('error', error);
  } finally {
    setDrawerProps({ loading: false });
  }
});

async function clear() {
  record.value = {} as TenantInfo;
  setDescProps({ data: {} });
}


function handleCopyTenantId() {
  copyToClipboard(record.value.id.id, 'Copied！')
}

function handleDeleteTenant() {
  emit('delete', record.value);
  closeDrawer();
}

function handleEditTenant() {
  emit('edit', record.value);
  closeDrawer();
}

function handleTenantAdmin() {
  emit('admin', record.value);
  closeDrawer();
}

</script>
<style lang="less">

</style>
