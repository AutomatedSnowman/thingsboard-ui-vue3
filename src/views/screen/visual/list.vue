<template>
  <div class="screen-visual-list">
    <BasicTable @register="registerTable">
      <template #headerTop>
        <div class="text-lg font-bold my-2">
          {{ t(getTitle.value) }}
        </div>
      </template>
      <template #tableTitle>
        <div class="space-x-2">
          <a-button type="primary" @click="handleForm({})">
            <Icon icon="i-fluent:add-12-filled" /> Large Dashboard
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
        <Space>
          <div class="h-10 w-10 bg-white flex justify-center">
            <div class="cursor-pointer h-10 w-full content-center" @click="handlePreview(record)">
              <img :src="record.image || defaultImage" :alt="record.title" class="w-full" />
            </div>
          </div>
          {{ record.title }}
        </Space>
      </template>
      <template #published="{ record }">
        <Tag v-if="record.published == true" color="success">Published</Tag>
        <Tag v-if="record.published == false" color="warning">Unpublished</Tag>
      </template>
      <template #itemContainer="{ record }">
        <ImageCard
          :value="record"
          @editinfo="handleEditInfo"
          @edit="handleEdit"
          @delete="handleDelete"
          @preview="handlePreview"
          @publish="handlePublish"
          @unpublish="handleUnPublish"
        />
      </template>
    </BasicTable>
    <InputForm @register="registerModal" @success="handleSuccess" />
  </div>
</template>
<script lang="ts">
  export default defineComponent({
    name: 'ViewsScreenVisualList',
  });
</script>
<script lang="ts" setup>
  import { defineComponent, h, reactive } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useModal } from '/@/components/Modal';
  import { BasicTable, BasicColumn, useTable } from '/@/components/Table';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { Icon } from '/@/components/Icon';
  import { Space, Tag } from 'ant-design-vue';
  import {
    getTbVisualInfoById,
    currentTenantVisualList,
    deleteTbVisual,
    createTbVisual,
    saveTbVisual,
  } from '/@/api/screen/visual';
  import InputForm from './form.vue';
  import { usePermission } from '/@/hooks/web/usePermission';
  import { Authority } from '/@/enums/authorityEnum';
  import { copyToClipboard, openWindow } from '/@/utils';
  import ImageCard from './imageCard.vue';
  import { isEmpty } from '/@/utils/is';
  const defaultImage = '/resource/img/no-data.svg';

  const { t } = useI18n('tb');
  const { createConfirm, showMessage } = useMessage();
  const { hasPermission } = usePermission();

  const getTitle = {
    value: 'Large Dashboard',
  };

  const searchParam = reactive({
    textSearch: '',
  });
  const tableColumns: BasicColumn[] = [
    {
      title: t('Name'),
      dataIndex: 'title',
      key: 'title',
      sorter: true,
      align: 'left',
      fixed: 'left',
      slot: 'firstColumn',
    },
    {
      title: t('State'),
      dataIndex: 'published',
      key: 'published',
      align: 'center',
      width: 100,
      slot: 'published',
      filterMultiple: false,
      filters: [
        { text: '已发布', value: 'true' },
        { text: '未发布', value: 'false' },
      ],
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
        icon: 'i-ant-design:safety-outlined',
        title: t('Modify'),
        ifShow: hasPermission(Authority.TENANT_ADMIN),
        onClick: handleEditInfo.bind(this, { ...record }),
      },
      {
        icon: 'i-clarity:note-edit-line',
        color: 'success',
        title: t('Edit Dashboard'),
        ifShow: hasPermission(Authority.TENANT_ADMIN),
        onClick: handleEdit.bind(this, { ...record }),
      },
      {
        icon: 'i-ant-design:send-outlined',
        color: 'success',
        title: t('Save Dashboard'),
        ifShow: !record.published && hasPermission(Authority.TENANT_ADMIN),
        onClick: handlePublish.bind(this, { ...record }),
      },
      {
        icon: 'i-ant-design:send-outlined',
        color: 'warning',
        title: t('Cancel Save'),
        ifShow: record.published && hasPermission(Authority.TENANT_ADMIN),
        onClick: handleUnPublish.bind(this, { ...record }),
      },
      {
        icon: 'ant-design:delete-outlined',
        color: 'error',
        title: t('Delete Dashboard'),
        onClick: handleDelete.bind(this, { ...record }),
      },
    ],
  };

  const [registerModal, { openModal }] = useModal();
  const [registerTable, { reload }] = useTable({
    rowKey: (record) => record.id.id,
    api: currentTenantVisualList,
    beforeFetch: wrapFetchParams,
    defSort: { sortProperty: 'createdTime', sortOrder: 'DESC' },
    columns: tableColumns,
    actionColumn: actionColumn,
    showTableSetting: true,
    useSearchForm: false,
    canResize: true,
    tableSetting: { card: true },
    cardList: true,
    cardGrid: { gutter: 8, xs: 24, sm: 12, md: 8, lg: 6, xl: 6 },
  });

  function wrapFetchParams(param: any) {
    return { ...param, textSearch: searchParam.textSearch };
  }

  function handleForm(record: Recordable) {
    openModal(true, record);
  }

  async function handleDelete(record: Recordable) {
    createConfirm({
      iconType: 'error',
      title: `Are you sure you want to delete [${record.name}]？`,
      content: 'WARNING: Are you sure you want to delete? All data will be unrecoverable.',
      centered: false,
      okText: 'Delete',
      okButtonProps: {
        type: 'primary',
        danger: true,
      },
      onOk: async () => {
        try {
          await deleteTbVisual(record.id.id);
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

  function handleEdit(record: Recordable) {
    const url = `/_visual#/chart/home/${record.id.id}`;
    openWindow(url, { target: '_blank' });
  }

  function handlePreview(record: Recordable) {
    if (!record.published) {
      handleEdit(record);
    } else {
      const url = `/_visual#/chart/preview/${record.id.id}`;
      openWindow(url, { target: '_blank' });
    }
  }

  function handlePublish(record: Recordable) {
    const previewUrl = `${location.protocol}//${location.host}/_visual#/chart/preview/${record.id.id}`;
    createConfirm({
      iconType: 'success',
      icon: () => h(Icon, { icon: 'ant-design:info-circle-filled', style: { color: 'blue' } }),
      closable: true,
      title: 'Save Dashboard',
      content: `Preview Address： ${previewUrl}`,
      width: '50%',
      okText: 'Save',
      cancelText: 'Copy',
      maskClosable: false,
      onCancel: () => copyToClipboard(previewUrl, 'Copied！'),
      onOk: () => handleSavePublush(record, true),
    });
  }
  function handleUnPublish(record: Recordable) {
    createConfirm({
      iconType: 'error',
      title: 'Cancel Save',
      content: `Confirm Cancellation？`,
      width: '50%',
      okText: 'Cancel Save',
      cancelText: 'Closure',
      maskClosable: false,
      onOk: () => handleSavePublush(record, false),
    });
  }

  function handleEditInfo(record: Recordable) {
    openModal(true, record);
  }

  async function handleSavePublush(record: Recordable, publish: boolean) {
    const tbVisualInfo = await getTbVisualInfoById(record.id.id);
    if (isEmpty(tbVisualInfo.content)) {
      return showMessage('Please edit the record first！');
    } else {
      const res = saveTbVisual({
        ...tbVisualInfo,
        published: publish,
      });
      showMessage(`${publish ? '发布' : 'Cancel Release'}Save！`);
      handleSuccess();
    }
  }
</script>
<style lang="less">
  .screen-visual-list {
  }
</style>
