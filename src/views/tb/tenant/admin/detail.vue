<template>
  <BasicDrawer
    v-bind="$attrs"
    :showFooter="false"
    @register="registerDrawer"
    width="60%"
    :rootClassName="'tb-detail-wrapper'"
  >
    <template #title>
      <div class="flex flex-row items-center">
        <Icon :icon="getTitle.icon" class="pr-3 m-1 tb-detail-title-icon" />
        <div class="flex flex-col">
          <span class="text-lg font-bold">{{ getTitle.value || '· · · ·' }}</span>
          <span class="text-sm">Tenant Admin Details</span>
        </div>
      </div>
    </template>
    <Tabs v-model:activeKey="tabActiveKey" class="tb-detail-menu">
      <TabPane key="DETAIL">
        <template #tab>
          <span> <Icon :icon="'ant-design:appstore-outlined'" /> 详情 </span>
        </template>
        <div class="space-x-4">
          <a-button type="primary" @click="handleAdminLogin">
            <Icon :icon="'ant-design:login-outlined'" />Log in as Admin
          </a-button>
          <a-button type="primary" @click="handleShowActivationLink">
            <Icon :icon="'ant-design:login-outlined'" />Show Activation Link
          </a-button>
          <a-button type="primary" @click="handleSendActivationEmail">
            <Icon :icon="'ant-design:login-outlined'" />Resend Activation Email
          </a-button>
          <a-button type="primary success" @click="handleEditUser">
            <Icon :icon="'i-clarity:note-edit-line'" />Edit Administrator
          </a-button>
          <a-button type="primary" danger @click="handleDeleteUser">
            <Icon :icon="'ant-design:delete-outlined'" />Delete Administrator
          </a-button>
        </div>
        <div class="space-x-4 my-4">
          <a-button @click="handleCopyUserId">
            <Icon :icon="'ant-design:copy-filled'" />
            Copy User ID
          </a-button>
        </div>
        <Description @register="register" size="default">
          <template #defaultDashboardFullscreen="{ val }">
            <Checkbox :checked="val">Default Full Screen</Checkbox>
          </template>
          <template #homeDashboardHideToolbar="{ val }">
            <Checkbox :checked="val">Hide Tool Bar</Checkbox>
          </template>
        </Description>
      </TabPane>
      <TabPane key="TELEMETRY">
        <template #tab>
          <span> <Icon :icon="'ant-design:line-chart-outlined'" /> Data </span>
        </template>
        <Telemetry  v-if="tabActiveKey == 'TELEMETRY'"  :entityType="EntityType.USER" :entityId="record?.id?.id" />
      </TabPane>
      <TabPane key="RELATION">
        <template #tab><span>
            <Icon :icon="'ant-design:radar-chart-outlined'" /> Association
          </span> </template>
        <Relation :entityType="EntityType.USER" :entityId="record?.id?.id" />
      </TabPane>
    </Tabs>
  </BasicDrawer>
</template>
<script lang="ts" setup name="ViewsTbTenantAdminDetail">
  import { ref, unref, computed, h } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { router } from '/@/router';
  import { copyToClipboard } from '/@/utils';
  import { Icon } from '/@/components/Icon';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import { getDashboardInfoById } from '/@/api/tb/dashboard';
  import { getUserById, getActivationLink, sendActivationEmail } from '/@/api/tb/user';
  import { Tabs, TabPane, Checkbox } from 'ant-design-vue';
  import { DescItem, Description, useDescription } from '/@/components/Description';
  import { UserInfo } from '/#/store';
  import { isEmpty } from 'lodash';
  import Telemetry from '/@/views/tb/telemetry/index.vue';
  import Relation from '/@/views/tb/relation/list.vue';
  import { EntityType } from '/@/enums/entityTypeEnum';

  const emit = defineEmits(['edit', 'delete', 'login', 'register']);

  const { t } = useI18n('tb');
  const { createConfirm, showMessage } = useMessage();
  const { meta } = unref(router.currentRoute);
  const record = ref<UserInfo>({} as UserInfo);

  const getTitle = computed(() => ({
    icon: meta.icon || 'ant-design:book-outlined',
    value: record.value.name,
  }));

  const tabActiveKey = ref('DETAIL');

  const descSchema: DescItem[] = [
    {
      label: t('Email'),
      field: 'email',
      span: 4,
    },
    {
      label: t('First Name'),
      field: 'firstName',
      span: 4,
    },
    {
      label: t('Phone Number'),
      field: 'phone',
      span: 2,
    },
    {
      label: t('Last Name'),
      field: 'lastName',
      span: 2,
    },

    {
      label: t('Additional Info'),
      field: 'additionalInfo.description',
      span: 4,
    },
    {
      label: t('Default Dashboard'),
      field: 'additionalInfo.defaultDashboardTitle',
      span: 2,
    },
    {
      label: '',
      field: 'additionalInfo.defaultDashboardFullscreen',
      slot: 'defaultDashboardFullscreen',
      span: 2,
    },
    {
      label: t('Home Dashboard'),
      field: 'additionalInfo.homeDashboardTitle',
      span: 2,
    },
    {
      label: '',
      field: 'additionalInfo.homeDashboardHideToolbar',
      slot: 'homeDashboardHideToolbar',
      span: 2,
    },
  ];
  const [register, { setDescProps }] = useDescription({
    schema: descSchema,
  });

  const [registerDrawer, { setDrawerProps, closeDrawer }] = useDrawerInner(async (data) => {
    try {
      setDrawerProps({ loading: true });
      await clear();
      record.value = await getUserById(data.id.id);
      if (!isEmpty(record.value.additionalInfo.defaultDashboardId)) {
        const defaultDashboard = await getDashboardInfoById(
          record.value.additionalInfo.defaultDashboardId,
        );
        record.value.additionalInfo.defaultDashboardTitle = defaultDashboard.title || '';
      }
      if (!isEmpty(record.value.additionalInfo.homeDashboardId)) {
        const homeDashboard = await getDashboardInfoById(
          record.value.additionalInfo.homeDashboardId,
        );
        record.value.additionalInfo.homeDashboardTitle = homeDashboard.title || '';
      }
      setDescProps({ data: record.value });
    } catch (error: any) {
      if (error.message) {
        showMessage(error.message, 'error');
      }
      console.log('error', error);
    } finally {
      setDrawerProps({ loading: false });
    }
  });

  async function clear() {
    record.value = {} as UserInfo;
    setDescProps({ data: {} });
  }

  function handleCopyUserId() {
    copyToClipboard(record.value.id.id, 'User ID Copied Successfully!');
  }

  function handleDeleteUser() {
    emit('delete', record.value);
    closeDrawer();
  }

  function handleEditUser() {
    emit('edit', record.value);
    closeDrawer();
  }

  async function handleShowActivationLink() {
    try {
      const activationLink = await getActivationLink(record.value.id.id);
      createConfirm({
        iconType: 'success',
        icon: () => h(Icon, { icon: 'ant-design:info-circle-filled', style: { color: 'blue' } }),
        title: 'User Activation Link',
        content: h('a', { href: activationLink, target: '_blank' }, `${activationLink}`),
        width: '50%',
        okText: 'Confirm',
        cancelText: 'Copy',
        maskClosable: false,
        onCancel: () => copyToClipboard(activationLink, 'Copied!'),
      });
    } catch (error) {
      console.log(error);
    }
  }

  async function handleSendActivationEmail() {
    try {
      await sendActivationEmail(record.value.email);
      showMessage('Activation Email Sent Successfully', 'success');
    } catch (error) {
      console.log(error);
    }
  }

  function handleAdminLogin() {
    emit('login', record.value);
    closeDrawer();
  }
</script>
<style lang="less"></style>
