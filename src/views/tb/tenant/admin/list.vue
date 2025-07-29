<template>
  <div class="tenant-admin-list">
    <BasicTable @register="registerTable">
      <template #headerTop>
        <div class="text-lg font-bold my-2">
          {{ t(getTitle.value) }} ( {{ tenantInfo.title }})
        </div>
      </template>
      <template #tableTitle>
        <div class="space-x-2">
          <a-button type="primary" @click="handleForm({})">
            <Icon icon="i-fluent:add-12-filled" /> Add Tenant Admin
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
        <a @click="handleDetail({ id: record.id })" :title="record.email">
          {{ record.email }}
        </a>
      </template>
    </BasicTable>
    <InputForm @register="registerModal" @success="handleSuccess" />
    <DetailDrawer
      @register="registerDrawer"
      @edit="handleForm"
      @delete="handleDelete"
      @login="handleLoginUser"
    />
  </div>
</template>
<script lang="ts">
  export default defineComponent({
    name: 'ViewsTbTenantAdminList',
  });
</script>
<script lang="ts" setup>
  import { defineComponent, ref } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useModal } from '/@/components/Modal';
  import { useDrawer } from '/@/components/Drawer';
  import { BasicTable, BasicColumn, useTable } from '/@/components/Table';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { Icon } from '/@/components/Icon';
  import { router } from '/@/router';
  import { tenantInfoById, TenantInfo } from '/@/api/tb/tenant';
  import { getTenantAdmins, deleteUser, getUserToken, getUserById } from '/@/api/tb/user';
  import { reactive } from 'vue';
  import InputForm from './form.vue';
  import DetailDrawer from './detail.vue';
  import { isEmpty } from '/@/utils/is';
  import { useUserStore } from '/@/store/modules/user';
  import { Authority } from '/@/enums/authorityEnum';

  const { t } = useI18n('tb');
  const userStore = useUserStore();
  const { createConfirm, showMessage, notification } = useMessage();

  const getTitle = {
    value: router.currentRoute.value.meta.title || 'Tenant Admin',
  };

  const tenantInfo = ref<TenantInfo>({} as TenantInfo);

  const searchParam = reactive({
    textSearch: '',
  });
  const tableColumns: BasicColumn[] = [
    {
      title: t('Email Address'),
      dataIndex: 'email',
      key: 'email',
      sorter: true,
      align: 'left',
      fixed: 'left',
      slot: 'firstColumn',
    },
    {
      title: 'First Name',
      dataIndex: 'firstName',
      width: 230,
      key: 'firstName',
    },
    {
      title: 'Last Name',
      dataIndex: 'lastName',
      key: 'lastName',
      width: 230,
    },
    {
      title: 'Phone Number',
      dataIndex: 'phone',
      key: 'phone',
      width: 140,
    },
    {
      title: 'Additional Info',
      dataIndex: 'additionalInfo.description',
      key: 'additionalInfo.description',
      ellipsis: true,
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
        icon: 'ant-design:login-outlined',
        title: t('Login as Tenant Admin'),
        onClick: handleLoginUser.bind(this, { ...record }),
      },
      {
        icon: 'ant-design:delete-outlined',
        color: 'error',
        title: t('Delete Tenant Admin'),
        onClick: handleDelete.bind(this, { ...record }),
      },
    ],
  };

  const [registerModal, { openModal }] = useModal();
  const [registerDrawer, { openDrawer }] = useDrawer();
  const [registerTable, { reload }] = useTable({
    rowKey: (record) => record.id.id,
    api: fetchData,
    beforeFetch: wrapFetchParams,
    defSort: { sortProperty: 'createdTime', sortOrder: 'DESC' },
    columns: tableColumns,
    actionColumn: actionColumn,
    showTableSetting: true,
    useSearchForm: false,
    canResize: true,
  });

  function wrapFetchParams(fetchParam: any) {
    return { ...fetchParam, textSearch: searchParam.textSearch };
  }

  async function fetchData(params: any) {
    const tenantId = router.currentRoute.value.params.tenantId as string;
    if (isEmpty(tenantId)) {
      return Promise.reject(new Error('租户为空！'));
    }
    return tenantInfoById(tenantId).then((res) => {
      tenantInfo.value = res;
      return getTenantAdmins(params, tenantId);
    });
  }

  async function handleLoginUser(record: Recordable) {
    try {
      const jwtPair = await getUserToken(record.id.id);
      userStore.setToken(jwtPair);

      const userInfo = await userStore.getUserInfoAction();

      if (userInfo) {
        notification.success({
          message: t('sys.login.loginSuccessTitle'),
          description: `${t('sys.login.loginSuccessDesc')}: ${userInfo.email}`,
          duration: 3,
        });

        await userStore.afterLoginAction(userInfo, true);
      }
    } catch (error: any) {
      showMessage(error.message, 'error');
    } finally {
      location.reload();
    }
  }

  function handleForm(record: Recordable) {
    openModal(true, {
      ...record,
      authority: Authority.TENANT_ADMIN,
      tenantId: tenantInfo.value.id,
    });
  }

  async function handleDelete(record: Recordable) {
    const modalFunc = createConfirm({
      iconType: 'error',
      title: `Are you sure you want to delete the Tenant Admin[${record.name}]？`,
      content: 'WARNING: After deletion, the admin account and all related data will be unrecoverable.',
      centered: false,
      okText: 'Delete',
      okButtonProps: {
        type: 'primary',
        danger: true,
      },
      onCancel: () => modalFunc.destroy(),
      onOk: async () => {
        try {
          await deleteUser(record.id.id);
          showMessage('Administrator deleted successfully!');
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
    openDrawer(true, record);
  }
</script>
<style lang="less">
  .tenant-admin-list {
  }
</style>
