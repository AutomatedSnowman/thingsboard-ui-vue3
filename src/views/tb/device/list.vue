<template>
  <div class="device-list">
    <BasicTable @register="registerTable">
      <template #headerTop>
        <div class="text-lg font-bold my-2">
          {{ t(getTitle.value) }}
        </div>
      </template>
      <template #tableTitle>
        <div class="space-x-2">
          <a-button
            type="primary"
            @click="handleForm({})"
            v-show="hasPermission(Authority.TENANT_ADMIN)"
          >
            <Icon icon="i-fluent:add-12-filled" /> Added Equipment
          </a-button>
          <a-input
            v-model:value="searchParam.textSearch"
            placeholder="Search..."
            allow-clear
            @change="reload"
            style="width: 240px"
          >
            <template #suffix>
              <icon icon="ant-design:search-outlined" />
            </template>
          </a-input>
        </div>
      </template>
      <template #firstColumn="{ record }">
        <a @click="handleDetail({ id: record.id })" :title="record.name">
          {{ record.name }}
        </a>
      </template>
      <template #active="{ record }">
        <Tag v-if="record.active == true" color="success">Online</Tag>
        <Tag v-if="record.active == false" color="error">Offline</Tag>
      </template>
      <template #gateway="{ record }">
        <Checkbox :checked="record.additionalInfo?.gateway || false" />
      </template>
      <template #customerIsPublic="{ record }">
        <Checkbox :checked="record.customerIsPublic" />
      </template>
    </BasicTable>
    <InputForm @register="registerFormModal" @success="handleSuccess" />
    <DetailDrawer
      @register="registerDetailDrawer"
      @edit="handleForm"
      @delete="handleDelete"
      @credentials="handleCredentials"
      @assignToPublic="handleAssignToPublic"
      @assignToCustomer="handleAssignCustomer"
      @unAssignFromCustomer="handleUnAssignFromCustomer"
    />
    <AssignCustomer @register="registerAssignCustomerModal" @success="handleSuccess" />
    <Credentials @register="registerCredentialsModal" @success="handleSuccess" />
  </div>
</template>
<script lang="ts">
  export default defineComponent({
    name: 'ViewsTbDeviceList',
  });
</script>
<script lang="ts" setup>
  import { defineComponent, onMounted, reactive, ref } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useModal } from '/@/components/Modal';
  import { useDrawer } from '/@/components/Drawer';
  import { BasicTable, BasicColumn, useTable } from '/@/components/Table';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { Icon } from '/@/components/Icon';
  import { Checkbox, Tag } from 'ant-design-vue';
  import { useUserStore } from '/@/store/modules/user';
  import {
    deleteDevice,
    getTenantDeviceInfoList,
    getCustomerDeviceInfoList,
    unAssignDeviceFromCustomer,
    assignDeviceToPublicCustomer,
  } from '/@/api/tb/device';
  import InputForm from './form.vue';
  import DetailDrawer from './detail.vue';
  import AssignCustomer from './assignCustomer.vue';
  import Credentials from './credentials.vue';
  import { Authority } from '/@/enums/authorityEnum';
  import { usePermission } from '/@/hooks/web/usePermission';
  import { getDeviceProfileInfoList } from '/@/api/tb/deviceProfile';
  import { router } from '/@/router';
  import { onBeforeRouteUpdate } from 'vue-router';

  const userStore = useUserStore();

  const { t } = useI18n('tb');
  const { hasPermission } = usePermission();
  const { createConfirm, showMessage } = useMessage();

  const getTitle = {
    value: 'Device',
  };

  const deviceProfileList = ref<any[]>([]);

  const searchParam = reactive({
    textSearch: '',
  });
  const tableColumns: BasicColumn[] = [
    {
      title: t('Name'),
      dataIndex: 'name',
      key: 'name',
      sorter: true,
      align: 'left',
      fixed: 'left',
      slot: 'firstColumn',
      ellipsis: false,
    },
    {
      title: 'Device Profile',
      dataIndex: 'deviceProfileName',
      key: 'deviceProfileId',
      align: 'left',
      ellipsis: false,
      filterMultiple: false,
      filters: deviceProfileList.value.map((item) => ({ text: item.name, value: item.id.id })),
    },
    {
      title: 'Label',
      dataIndex: 'label',
      key: 'label',
      align: 'left',
      ellipsis: false,
    },
    {
      title: 'Customer Name',
      dataIndex: 'customerTitle',
      key: 'customerTitle',
      align: 'left',
      ellipsis: false,
      ifShow: hasPermission(Authority.TENANT_ADMIN),
    },
    {
      title: 'State',
      dataIndex: 'active',
      key: 'active',
      align: 'center',
      width: 100,
      slot: 'active',
      filterMultiple: false,
      filters: [
        { text: 'Online', value: 'true' },
        { text: 'Offline', value: 'false' },
      ],
    },
    {
      title: 'Visibility',
      dataIndex: 'customerIsPublic',
      key: 'customerIsPublic',
      width: 80,
      align: 'center',
      slot: 'customerIsPublic',
      ifShow: hasPermission(Authority.TENANT_ADMIN),
    },
    {
      title: 'Gateway',
      dataIndex: 'gateway',
      key: 'gateway',
      width: 80,
      align: 'center',
      slot: 'gateway',
    },
    {
      title: t('Creation Time'),
      dataIndex: 'createdTime',
      key: 'createdTime',
      format: 'date|YYYY-MM-DD HH:mm:ss',
      sorter: true,
      width: 160,
      align: 'center',
    },
  ];

  const actionColumn: BasicColumn = {
    width: 160,
    actions: (record: Recordable) => [
      {
        icon: 'ant-design:share-alt-outlined',
        title: t('Set as public'),
        ifShow: hasPermission(Authority.TENANT_ADMIN) && !!!record.customerTitle,
        onClick: handleAssignToPublic.bind(this, { ...record }),
      },
      {
        icon: 'ant-design:contacts-outlined',
        title: t('Assign Customers'),
        ifShow: hasPermission(Authority.TENANT_ADMIN) && !!!record.customerTitle,
        onClick: handleAssignCustomer.bind(this, { ...record }),
      },
      {
        icon: 'ant-design:rollback-outlined',
        title: t('Unassign from customer'),
        ifShow: hasPermission(Authority.TENANT_ADMIN) && !!record.customerTitle,
        onClick: handleUnAssignFromCustomer.bind(this, { ...record }),
      },
      {
        icon: 'ant-design:safety-outlined',
        title: t('Credentials'),
        onClick: handleCredentials.bind(this, { ...record }),
      },
      {
        icon: 'ant-design:delete-outlined',
        color: 'error',
        title: t('Delete Device Configuration'),
        ifShow: hasPermission(Authority.TENANT_ADMIN),
        onClick: handleDelete.bind(this, { ...record }),
      },
    ],
  };

  const [registerCredentialsModal, { openModal: openCredentialsModal }] = useModal();
  const [registerAssignCustomerModal, { openModal: openAssignCustomerModal }] = useModal();
  const [registerFormModal, { openModal: openFormModal }] = useModal();
  const [registerDetailDrawer, { openDrawer: openDetailDrawer }] = useDrawer();
  const [registerTable, { reload, updateColumn }] = useTable({
    rowKey: (record) => record.id.id,
    api: fetchDeviceList,
    beforeFetch: wrapFetchParams,
    defSort: { sortProperty: 'createdTime', sortOrder: 'DESC' },
    columns: tableColumns,
    actionColumn: actionColumn,
    showTableSetting: true,
    useSearchForm: false,
    canResize: true,
  });

  function wrapFetchParams(param: any) {
    const active = param.active ? param.active[0] : null;
    const deviceProfileId = param.deviceProfileId ? param.deviceProfileId[0] : null;
    return {
      ...param,
      textSearch: searchParam.textSearch,
      active: active,
      deviceProfileId: deviceProfileId,
    };
  }

  async function fetchDeviceList(param: any) {
    return await getDeviceProfileInfoList({
      pageSize: 2147483647,
      page: 0,
      sortProperty: 'name',
      sortOrder: 'ASC',
    }).then((result) => {
      deviceProfileList.value = result.data;
      updateColumn({
        title: 'Profile',
        dataIndex: 'deviceProfileName',
        key: 'deviceProfileId',
        align: 'left',
        ellipsis: false,
        filters: deviceProfileList.value.map((item) => ({ text: item.name, value: item.id.id })),
      });
      return hasPermission(Authority.CUSTOMER_USER)
        ? getCustomerDeviceInfoList(param, userStore.getUserInfo?.customerId.id || '')
        : getTenantDeviceInfoList(param);
    });
  }

  function handleForm(record: Recordable) {
    openFormModal(true, record);
  }

  async function handleDelete(record: Recordable) {
    createConfirm({
      iconType: 'error',
      title: `Delete device[${record.name}]？`,
      content: 'WARNING: After deletion, all device data will be unrecoverable.',
      centered: false,
      okText: 'Delete',
      okButtonProps: {
        type: 'primary',
        danger: true,
      },
      onOk: async () => {
        try {
          await deleteDevice(record.id.id);
          showMessage('Device Deleted Successfully！');
        } catch (error: any) {
          console.log(error);
        } finally {
          handleSuccess();
        }
      },
    });
  }

  function handleCredentials(record: Recordable) {
    openCredentialsModal(true, { ...record });
  }

  function handleAssignToPublic(record: Recordable) {
    createConfirm({
      iconType: 'info',
      title: `Are you sure you want to set [${record.name}] public？`,
      content: 'CAUTION: After confirmation, device records will be publicly accessible!',
      centered: false,
      okText: 'Confirm',
      okButtonProps: {
        type: 'primary',
      },
      onOk: async () => {
        try {
          await assignDeviceToPublicCustomer(record.id.id);
          showMessage('Success！');
        } catch (error: any) {
          console.log(error);
        } finally {
          handleSuccess();
        }
      },
    });
  }

  function handleAssignCustomer(record: Recordable) {
    openAssignCustomerModal(true, { ...record });
  }

  function handleUnAssignFromCustomer(record: Recordable) {
    createConfirm({
      iconType: 'info',
      title: `Are you sure yo want to set [${record.name}] to private？`,
      content: 'After confirmation, device data will be private.',
      centered: false,
      okText: 'Confirm',
      okButtonProps: {
        type: 'primary',
      },
      onOk: async () => {
        try {
          await unAssignDeviceFromCustomer(record.id.id);
          showMessage('Success！');
        } catch (error: any) {
          console.log(error);
        } finally {
          handleSuccess();
        }
      },
    });
  }

  function handleSuccess() {
    reload();
  }

  function handleDetail(record: Recordable) {
    openDetailDrawer(true, record);
  }

  onMounted(() => {
    if (router.currentRoute.value.query.deviceId) {
      const deviceId = router.currentRoute.value.query.deviceId;
      router.currentRoute.value.query = {};
      openDetailDrawer(true, { id: { id: deviceId } });
    }
  });
</script>
<style lang="less">
  .device-list {
  }
</style>
