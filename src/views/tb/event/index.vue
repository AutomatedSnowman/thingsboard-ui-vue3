<template>
  <div class="event-index">
    <BasicTable @register="registerTable" :columns="tableColumns">
      <template #toolbar>
        <Tooltip placement="bottom">
          <template #title>
            <span>{{ t('Clear Events') }}</span>
          </template>
          <Icon icon="ant-design:delete-outlined" :size="20" class="cursor-pointer" :style="{ color: 'red' }"
            @click="handelClear()" v-if="hasPermission(Authority.TENANT_ADMIN)" />
        </Tooltip>
      </template>
      <template #tableTitle>
        <div class="space-x-2">
          <Select v-model:value="eventFilter.eventType" :options="entityTypeOptions" style="width: 130px"
            @change="reload()">
          </Select>
          <RangePicker v-model:value="searchParam.timeRange" style="width: 300px" show-time :allow-clear="false"
            format="YYYY/MM/DD HH:mm" :presets="rangePresets" @change="reload()" />
        </div>
      </template>
    </BasicTable>

  </div>
</template>
<script lang="ts">
export default defineComponent({
  name: "ViewsTbEventList",
});
</script>
<script lang="ts" setup>
import { defineComponent, ref, reactive, unref, computed } from 'vue';
import { RangePicker, Select, Tooltip } from 'ant-design-vue';
import { BasicTable, BasicColumn, useTable } from '/@/components/Table';
import { useI18n } from '/@/hooks/web/useI18n';
import { Icon } from '/@/components/Icon';
import { EVENT_TYPE_OPTIONS, EventType } from "/@/enums/eventEnum";
import { EntityType } from '/@/enums/entityTypeEnum';
import { Authority } from '/@/enums/authorityEnum';
import { usePermission } from '/@/hooks/web/usePermission';
import { clearEvents, getEvents, EventFilter } from '/@/api/tb/events';
import { useMessage } from '/@/hooks/web/useMessage';
import { useUserStore } from '/@/store/modules/user';
import dayjs from 'dayjs';

const userStore = useUserStore();
const { hasPermission } = usePermission();


const { t } = useI18n('tb');

const props = defineProps({
  entityType: {
    type: String as PropType<EntityType>,
    required: true,
  },
  entityId: {
    type: String,
    required: true,
  }
});

const { createConfirm, showMessage } = useMessage();


const rangePresets = ref([
  { label: 'Today', value: [dayjs().startOf('D'), dayjs()] },
  { label: 'Last Hour', value: [dayjs().subtract(1, 'hour'), dayjs()] },
  { label: 'Last 6 Hours', value: [dayjs().subtract(6, 'hour'), dayjs()] },
  { label: 'Last Day', value: [dayjs().subtract(1, 'day').startOf('D'), dayjs()] },
  { label: 'Last 2 Days', value: [dayjs().subtract(2, 'day').startOf('D'), dayjs()] },
  { label: 'Last Week', value: [dayjs().subtract(6, 'day').startOf('D'), dayjs()] },
]);

const entityTypeOptions = computed(() => {
  if (EntityType.RULE_NODE == props.entityType) {
    return EVENT_TYPE_OPTIONS.filter(item => item.value != EventType.DEBUG_RULE_CHAIN);
  } else if (EntityType.RULE_CHAIN == props.entityType) {
    return EVENT_TYPE_OPTIONS.filter(item => item.value != EventType.DEBUG_RULE_NODE);
  } else {
    return EVENT_TYPE_OPTIONS.filter(item => item.value != EventType.DEBUG_RULE_NODE && item.value != EventType.DEBUG_RULE_CHAIN);
  }

})

const eventFilter = reactive<EventFilter>({
  eventType: EventType.ERROR
})

const searchParam = reactive({
  textSearch: '',
  timeRange: [dayjs().startOf('D'), dayjs()]
})

const tableColumns = computed(() => {
  const columns: BasicColumn[] = [{
    title: t('Event Time'),
    dataIndex: 'createdTime',
    key: 'createdTime',
    format: 'date|YYYY-MM-DD HH:mm:ss',
    sorter: true,
    width: 180,
    fixed: 'left',
    align: 'center',
  },
  {
    title: t('Server'),
    dataIndex: 'body.server',
    key: 'server',
    align: 'center',
    fixed: 'left',
    width: 180,
  }];

  switch (eventFilter.eventType) {
    case EventType.ERROR:
      columns.push(
        {
          title: t('Method'),
          dataIndex: 'body.method',
          key: 'method',
          align: 'left',
        },
        {
          title: t('Error'),
          dataIndex: 'body.errorStr',
          key: 'errorStr',
          align: 'left',
          width: 100,
        })
      break;
    case EventType.LC_EVENT:
      columns.push(
        {
          title: t('Event'),
          dataIndex: 'body.event',
          key: 'event',
          align: 'left',
        },
        {
          title: t('Status'),
          dataIndex: 'body.status',
          key: 'status',
          align: 'left',
          width: 80,
        },
        {
          title: t('Error'),
          dataIndex: 'body.errorStr',
          key: 'errorStr',
          align: 'left',
          width: 100,
        })
      break;
    case EventType.STATS:
      columns.push(
        {
          title: t('Message Processing'),
          dataIndex: 'body.messagesProcessed',
          key: 'messagesProcessed',
          align: 'center',
        },
        {
          title: t('Error Occurred'),
          dataIndex: 'body.errorsOccurred',
          key: 'errorsOccurred',
          align: 'center',
        })
      break;
    case EventType.DEBUG_RULE_CHAIN:
      columns.push(
        {
          title: t('News'),
          dataIndex: 'body.message',
          key: 'message',
          align: 'left',
        },
        {
          title: t('Error'),
          dataIndex: 'body.errorStr',
          key: 'errorStr',
          align: 'center',
          width: 100,
        })
      break;
    case EventType.DEBUG_RULE_NODE:
      columns.push(
        {
          title: t('Type'),
          dataIndex: 'body.msgDirectionType',
          key: 'msgDirectionType',
          align: 'center',
        },
        {
          title: t('Entity Type'),
          dataIndex: 'body.entityType',
          key: 'entityType',
          align: 'center',
        },
        {
          title: t('Entity ID'),
          dataIndex: 'body.entityId',
          key: 'entityId',
          align: 'center',
        },
        {
          title: t('Message ID'),
          dataIndex: 'body.msgId',
          key: 'msgId',
          align: 'center',
        },
        {
          title: t('Message Type'),
          dataIndex: 'body.msgType',
          key: 'msgType',
          align: 'center',
        },
        {
          title: t('Relation Type'),
          dataIndex: 'body.relationType',
          key: 'relationType',
          align: 'center',
        },
      )
      break;

  }


  return columns;
});

const [registerTable, { reload, updateColumn }] = useTable({
  api: fetchData,
  beforeFetch: wrapFetchParams,
  rowKey: (record) => record.id.id,
  showIndexColumn: false,
  defSort: { sortProperty: 'createdTime', sortOrder: 'DESC' },
  // columns: tableColumns,
  showTableSetting: true,
  useSearchForm: false,
  canResize: true,

});

function wrapFetchParams(fetchParam: any) {
  const startTime = searchParam.timeRange && searchParam.timeRange[0] ? searchParam.timeRange[0].valueOf() : null;
  const endTime = searchParam.timeRange && searchParam.timeRange[1] ? searchParam.timeRange[1].valueOf() : null;
  const tenantId = userStore.getUserInfo.tenantId.id;
  return { ...fetchParam, textSearch: searchParam.textSearch, startTime: startTime, endTime: endTime, tenantId: tenantId }

}
async function fetchData(param: any) {

  return await getEvents(
    props.entityType,
    props.entityId,
    unref(eventFilter),
    param
  );
}

function handelClear() {
  createConfirm({
    iconType: 'error',
    title: 'Clear All Events',
    content: 'Clear All Events？',
    centered: false,
    okText: 'Confirm',
    okButtonProps: {
      type: 'primary',
      danger: true,
    },
    onOk: async () => {
      try {
        await clearEvents(
          props.entityType,
          props.entityId,
          {
            startTime: searchParam.timeRange && searchParam.timeRange[0] ? searchParam.timeRange[0].valueOf() : 0,
            endTime: searchParam.timeRange && searchParam.timeRange[1] ? searchParam.timeRange[1].valueOf() : 0,
          },
          unref(eventFilter),
        );
        showMessage('Events Cleared Successfully！');
      } catch (error: any) {
        console.log(error);
      } finally {
        reload();
      }
    }

  })
}



</script>
<style lang="less">
.event-index {}
</style>
