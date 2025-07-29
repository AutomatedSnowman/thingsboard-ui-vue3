import { useI18n } from '/@/hooks/web/useI18n';
import { BasicColumn, BasicTableProps, FormProps } from '/@/components/Table';
import { userListData } from '/@/api/sys/user';

const { t } = useI18n('sys.empUser');

const modalProps = {
  title: t('User Selection'),
};

const searchForm: FormProps = {
  baseColProps: { md: 8, lg: 6 },
  labelWidth: 60,
  schemas: [
    {
      label: t('Account'),
      field: 'loginCode',
      component: 'Input',
    },
    {
      label: t('Username'),
      field: 'userName',
      component: 'Input',
    },
    {
      label: t('Status'),
      field: 'status',
      component: 'Select',
      componentProps: {
        dictType: 'sys_user_status',
        allowClear: true,
      },
    },
    {
      field: 'none',
      component: 'None',
    },
    {
      label: t('Mobile Phone Number'),
      field: 'mobile',
      component: 'Input',
    },
    {
      label: t('Email Address'),
      field: 'email',
      component: 'Input',
    },
    {
      label: t('Phone Number'),
      field: 'phone',
      component: 'Input',
    },
  ],
};

const tableColumns: BasicColumn[] = [
  {
    title: t('Login Account'),
    dataIndex: 'loginCode',
    key: 'a.login_code',
    sorter: true,
    width: 100,
    slot: 'firstColumn',
  },
  {
    title: t('Username'),
    dataIndex: 'userName',
    key: 'a.user_name',
    sorter: true,
    width: 100,
  },
  {
    title: t('Name'),
    dataIndex: 'refName',
    key: 'a.ref_name',
    sorter: true,
    width: 100,
  },
  {
    title: t('Email'),
    dataIndex: 'email',
    key: 'a.email',
    sorter: true,
    width: 130,
  },
  {
    title: t('Mobile Phone Number'),
    dataIndex: 'mobile',
    key: 'a.mobile',
    sorter: true,
    width: 130,
  },
  {
    title: t('Phone Number'),
    dataIndex: 'phone',
    key: 'a.phone',
    sorter: true,
    width: 130,
  },
  {
    title: t('Update Time'),
    dataIndex: 'updateDate',
    key: 'a.update_date',
    sorter: true,
    width: 130,
  },
  {
    title: t('Status'),
    dataIndex: 'status',
    key: 'a.status',
    sorter: true,
    width: 80,
    dictType: 'sys_status',
  },
];

const tableProps: BasicTableProps = {
  api: userListData,
  beforeFetch: (params) => {
    params['isAll'] = true;
    return params;
  },
  columns: tableColumns,
  formConfig: searchForm,
  rowKey: 'userCode',
};

export default {
  modalProps,
  tableProps,
  itemCode: 'userCode',
  itemName: 'userName',
  isShowCode: true,
};
